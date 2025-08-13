-- game_config KV table
create table if not exists game_config (
  key text primary key,
  value jsonb not null
);

-- defaults
insert into game_config(key, value) values
  ('thresholds', '{"base":10, "growth":"linear"}'),
  ('level_bonus_policy', '{"coins":"multiply","tickets":"add","coin_multiplier":"multiply"}')
  on conflict (key) do nothing;
insert into game_config(key, value) values ('claim_ttl_seconds', '10') on conflict (key) do nothing;
insert into game_config(key, value) values ('coins_per_tap', '1') on conflict (key) do nothing;
insert into game_config(key, value) values ('ad_ttl_seconds', '10') on conflict (key) do nothing;
insert into game_config(key, value) values ('ingest', '{"max_taps_per_batch":50,"clamp_soft":true}') on conflict (key) do nothing;

-- Per-level reward templates (simple variant; season/segment reserved for future)
create table if not exists level_reward_templates (
  template_id uuid primary key default gen_random_uuid(),
  level int not null,
  season_id text,
  segment text,
  active bool default true,
  payload jsonb not null,
  updated_at timestamptz default now()
);
create unique index if not exists uq_level_reward_templates_active
  on level_reward_templates (coalesce(season_id,'*'), coalesce(segment,'*'), level)
  where active is true;

-- Ensure level_events has template_id column for auditability
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='level_events' and column_name='template_id'
  ) then
    alter table level_events add column template_id uuid;
  end if;
end $$;

-- session_start: rotates epoch and sets new session id
create or replace function session_start(p_user_id uuid)
returns table(session_id uuid, session_epoch uuid, last_applied_seq bigint) language plpgsql as $$
begin
  session_id := gen_random_uuid();
  session_epoch := gen_random_uuid();
  last_applied_seq := 0;

  insert into user_profiles(user_id) values (p_user_id)
    on conflict (user_id) do nothing;

  insert into user_counters(user_id, session_epoch, current_session_id, last_applied_seq)
  values (p_user_id, session_epoch, session_id, 0)
  on conflict (user_id) do update
    set session_epoch = excluded.session_epoch,
        current_session_id = excluded.current_session_id,
        last_applied_seq = excluded.last_applied_seq;

  return next;
end;$$;

-- helper: compute next threshold
create or replace function _next_threshold(p_level int)
returns jsonb language sql stable as $$
  select jsonb_build_object('level', p_level + 1, 'coins', (p_level + 1) * ((select (value->>'base')::int from game_config where key='thresholds')))
$$;

-- apply_tap_batch: minimal guards, idempotency by (user_id,batch_id)
create or replace function apply_tap_batch(
  p_user_id uuid,
  p_batch_id uuid,
  p_session_id uuid,
  p_session_epoch uuid,
  p_client_seq bigint,
  p_taps int,
  p_coins_delta bigint,
  p_checksum text
) returns table(
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint,
  leveled_up jsonb,
  next_threshold jsonb
) language plpgsql as $$
declare
  v_counters user_counters%rowtype;
  v_prev_seq bigint;
  v_new_coins bigint;
  v_new_total_taps bigint;
  v_level int;
  v_base int;
  v_any_leveled boolean := false;
  v_threshold int;
  v_tickets_base_total int := 0; -- legacy; no longer used when templates are enabled
  v_cpt int;
  v_eff_mult numeric;
  v_earned_num numeric;
  v_earned bigint;
  v_tpl_payload jsonb;
  v_tpl_id uuid;
  v_reward_coins_total bigint := 0;
  v_reward_tickets_total int := 0;
  v_reward_coin_mult_delta numeric := 0;

begin
  -- idempotency: if batch exists, treat as dup and return current state
  if exists(select 1 from tap_batches where user_id=p_user_id and batch_id=p_batch_id) then
    select * into v_counters from user_counters where user_id=p_user_id;
    coins := v_counters.coins; tickets := v_counters.tickets; coin_multiplier := v_counters.coin_multiplier; level := v_counters.level; total_taps := v_counters.total_taps;
    leveled_up := null; next_threshold := _next_threshold(level);
    return next;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text));

  select * into v_counters from user_counters where user_id=p_user_id for update;
  -- simple rate limit using updated_at and config batch_min_interval_ms
  declare
    v_min_ms int;
  begin
  select coalesce((value->>'batch_min_interval_ms')::int, 100) into v_min_ms from game_config where key='thresholds';
  if v_counters.updated_at is not null and (extract(epoch from (now() - v_counters.updated_at))*1000) < v_min_ms then
    raise exception 'RATE_LIMITED';
  end if;
  end;
  if not found then
    raise exception 'USER_NOT_INITIALIZED';
  end if;

  if v_counters.session_epoch is distinct from p_session_epoch then
    raise exception 'SUPERSEDED';
  end if;

  v_prev_seq := coalesce(v_counters.last_applied_seq, 0);
  if p_client_seq < v_prev_seq then
    raise exception 'SEQ_REWIND';
  end if;

  -- compute earned coins server-side: taps × coins_per_tap × coin_multiplier
  -- coins_per_tap may be missing; default to 1 safely
  select (value::text)::int into v_cpt from game_config where key='coins_per_tap';
  if not found or v_cpt is null then v_cpt := 1; end if;
  v_eff_mult := coalesce(v_counters.coin_multiplier, 1.0);
  v_earned_num := greatest(0, p_taps) * v_cpt * v_eff_mult;
  v_earned := floor(v_earned_num)::bigint;

  v_new_coins := coalesce(v_counters.coins,0) + v_earned;
  v_new_total_taps := coalesce(v_counters.total_taps,0) + greatest(0, p_taps);
  v_level := coalesce(v_counters.level,0);

  -- level-up loop based on base threshold
  select (value->>'base')::int into v_base from game_config where key='thresholds';
  if v_base is null then v_base := 10; end if;
  v_threshold := v_base * (v_level + 1);
  while v_new_coins >= v_threshold loop
    v_new_coins := v_new_coins - v_threshold;
    v_level := v_level + 1;
    v_any_leveled := true;
    -- resolve per-level template with fallback to global default (level=0)
    select payload, template_id into v_tpl_payload, v_tpl_id
      from (
        select payload, template_id from level_reward_templates
        where active is true and level_reward_templates.level = v_level
        order by updated_at desc
        limit 1
      ) x;
    if v_tpl_payload is null then
      select payload, template_id into v_tpl_payload, v_tpl_id
        from (
          select payload, template_id from level_reward_templates
          where active is true and level_reward_templates.level = 0
          order by updated_at desc
          limit 1
        ) y;
    end if;
    if v_tpl_payload is null then
      v_tpl_payload := '{"tickets":3}'::jsonb; -- minimal safe fallback
    end if;
    -- compute base reward from template and apply immediately
    declare
      v_base_coins bigint := coalesce((v_tpl_payload->>'coins')::bigint, 0);
      v_base_tickets int := coalesce((v_tpl_payload->>'tickets')::int, 0);
      v_base_coin_mult numeric := coalesce((v_tpl_payload->>'coin_multiplier')::numeric, 0);
    begin
      v_reward_coins_total := v_reward_coins_total + v_base_coins;
      v_reward_tickets_total := v_reward_tickets_total + v_base_tickets;
      v_reward_coin_mult_delta := v_reward_coin_mult_delta + v_base_coin_mult;
      insert into level_events(user_id, level, base_reward, reward_payload, bonus_offered, template_id)
        values (p_user_id, v_level, v_base_coins, v_tpl_payload, true, v_tpl_id);
    end;
    v_threshold := v_base * (v_level + 1);
  end loop;

  update user_counters set coins = v_new_coins + v_reward_coins_total,
                           tickets = COALESCE(user_counters.tickets,0) + v_reward_tickets_total,
                           coin_multiplier = COALESCE(user_counters.coin_multiplier,1.0) + v_reward_coin_mult_delta,
                           total_taps = v_new_total_taps,
                           level = v_level,
                           last_applied_seq = p_client_seq,
                           updated_at = now()
  where user_id = p_user_id;

  insert into tap_batches(batch_id, user_id, session_id, client_seq, taps, coins_delta, checksum, status)
  values(p_batch_id, p_user_id, p_session_id, p_client_seq, p_taps, p_coins_delta, p_checksum, 'applied');

  coins := v_new_coins + v_reward_coins_total;
  tickets := coalesce(v_counters.tickets,0) + v_reward_tickets_total;
  coin_multiplier := coalesce(v_counters.coin_multiplier,1.0) + v_reward_coin_mult_delta;
  level := v_level;
  total_taps := v_new_total_taps;
  leveled_up := case when v_any_leveled then jsonb_build_object('level', v_level) else null end;
    -- update leaderboard projection
  insert into leaderboard_global(user_id, level, updated_at) values (p_user_id, v_level, now())
    on conflict(user_id) do update set level=excluded.level, updated_at=now();
  next_threshold := _next_threshold(level);
  return next;
end;$$;


-- claim_level_bonus: apply bonus for a specific level if not claimed and within TTL
create or replace function claim_level_bonus(
  p_user_id uuid,
  p_level int,
  p_bonus_multiplier numeric
) returns table(
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint
) language plpgsql as $$
declare
  v_evt level_events%rowtype;
  v_payload jsonb;
  v_now timestamptz := now();
  v_ttl int := 180;
  v_coins_delta bigint := 0;
  v_tickets_delta int := 0;
  v_coin_mult_delta numeric := 0;
  v_counters user_counters%rowtype;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  select * into v_evt from level_events where user_id=p_user_id and level_events.level=p_level order by created_at desc limit 1 for update;
  v_payload := coalesce(v_evt.reward_payload, '{}'::jsonb);
  if not found then raise exception 'NOT_FOUND'; end if;
  select coalesce((value)::int, 180) into v_ttl from game_config where key='claim_ttl_seconds';
  if extract(epoch from (v_now - v_evt.created_at)) > v_ttl then raise exception 'TTL_EXPIRED'; end if;
  if v_evt.bonus_multiplier is not null then raise exception 'ALREADY_CLAIMED'; end if;

  -- compute payload (coins only for now)
  if v_payload ? 'coins' then
    v_coins_delta := ((v_payload->>'coins')::bigint) * coalesce(p_bonus_multiplier,1);
  end if;
  if v_payload ? 'tickets' then
    v_tickets_delta := ((v_payload->>'tickets')::int * COALESCE(p_bonus_multiplier,1))::int;
  end if;

  update level_events set bonus_multiplier = p_bonus_multiplier where id = v_evt.id;

  select * into v_counters from user_counters where user_id=p_user_id for update;
  update user_counters set coins = coalesce(user_counters.coins,0) + v_coins_delta,
                           tickets = coalesce(user_counters.tickets,0) + v_tickets_delta,
                           updated_at = now()
  where user_id=p_user_id;

  coins := (coalesce(v_counters.coins,0) + v_coins_delta);
  tickets := (coalesce(v_counters.tickets,0) + v_tickets_delta);
  coin_multiplier := coalesce(v_counters.coin_multiplier,1.0) + v_coin_mult_delta;
  level := coalesce(v_counters.level,0);
  total_taps := coalesce(v_counters.total_taps,0);
  return next;
end;$$;


-- apply_reward_event: writes reward_events (simplified) and updates counters atomically
create or replace function apply_reward_event(
  p_user_id uuid,
  p_source_type text,
  p_source_ref text,
  p_base_payload jsonb,
  p_multiplier numeric
) returns table(
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint
) language plpgsql as $$
declare
  v_coins_delta bigint := coalesce((p_base_payload->>'coins')::bigint, 0);
  v_tickets_delta int := coalesce((p_base_payload->>'tickets')::int, 0);
  v_coin_mult_delta numeric := coalesce((p_base_payload->>'coin_multiplier')::numeric, 0);
  v_counters user_counters%rowtype;
begin
  if p_multiplier is not null and v_coins_delta <> 0 then v_coins_delta := floor(v_coins_delta * p_multiplier); end if;
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  select * into v_counters from user_counters where user_id=p_user_id for update;
  insert into reward_events(id, user_id, source_type, source_ref_id, base_payload, multiplier_applied, effective_payload, coins_delta, tickets_delta, idempotency_key)
    values (gen_random_uuid(), p_user_id, p_source_type, p_source_ref, p_base_payload, p_multiplier, p_base_payload, v_coins_delta, v_tickets_delta, gen_random_uuid());
  update user_counters set coins = coalesce(user_counters.coins,0) + v_coins_delta,
                           tickets = coalesce(user_counters.tickets,0) + v_tickets_delta,
                           coin_multiplier = coalesce(user_counters.coin_multiplier,1.0) + v_coin_mult_delta,
                           updated_at = now()
  where user_id=p_user_id;
  coins := coalesce(v_counters.coins,0) + v_coins_delta;
  tickets := coalesce(v_counters.tickets,0) + v_tickets_delta;
  coin_multiplier := coalesce(v_counters.coin_multiplier,1.0) + v_coin_mult_delta;
  level := coalesce(v_counters.level,0);
  total_taps := coalesce(v_counters.total_taps,0);
  return next;
end;$$;


-- claim_task: verification=none; grants reward and marks claimed
create or replace function claim_task(
  p_user_id uuid,
  p_task_id uuid
) returns table(
  state text,
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint
) language plpgsql as $$
declare
  v_def task_definitions%rowtype;
  v_prog task_progress%rowtype;
  v_reward jsonb := '{}'::jsonb;
  v_row record;
begin
  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  select * into v_def from task_definitions where task_id=p_task_id for update;
  if not found or v_def.active is not true then raise exception 'NOT_FOUND'; end if;
  select * into v_prog from task_progress where user_id=p_user_id and task_id=p_task_id for update;
  if found and v_prog.state = 'claimed' then raise exception 'ALREADY_CLAIMED'; end if;

  if v_def.verification <> 'none' then raise exception 'VERIFICATION_REQUIRED'; end if;

  v_reward := coalesce(v_def.reward_payload, '{}'::jsonb);
  update task_progress set state='claimed', claimed_at=now() where user_id=p_user_id and task_id=p_task_id;
  if not found then
    insert into task_progress(user_id, task_id, state, claimed_at) values (p_user_id, p_task_id, 'claimed', now());
  end if;
  select * into v_row from apply_reward_event(p_user_id, 'task_claim', p_task_id::text, v_reward, null);
  state := 'claimed';
  coins := v_row.coins; tickets := v_row.tickets; coin_multiplier := v_row.coin_multiplier; level := v_row.level; total_taps := v_row.total_taps;
  return next;
end;$$;

DROP FUNCTION IF EXISTS claim_level_bonus(uuid,int,numeric);

-- claim_level_bonus v2: idempotent, applies reward, levels, updates leaderboard
CREATE OR REPLACE FUNCTION claim_level_bonus(
  p_user_id uuid,
  p_level int,
  p_bonus_multiplier numeric,
  p_idempotency_key uuid
) RETURNS TABLE(
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint
) LANGUAGE plpgsql AS $$
DECLARE
  v_evt level_events%rowtype;
  v_payload jsonb;
  v_now timestamptz := now();
  v_ttl int := 180;
  v_coins_delta bigint := 0;
  v_tickets_delta int := 0;
  v_coin_mult_delta numeric := 0;
  v_policy jsonb := (select value from game_config where key='level_bonus_policy');
  v_counters user_counters%rowtype;
  v_claim_logged boolean := false;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
  SELECT * INTO v_evt FROM level_events WHERE user_id=p_user_id AND level_events.level=p_level ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  SELECT COALESCE((value)::int, 180) INTO v_ttl FROM game_config WHERE key='claim_ttl_seconds';
  IF EXTRACT(EPOCH FROM (v_now - v_evt.created_at)) > v_ttl THEN RAISE EXCEPTION 'TTL_EXPIRED'; END IF;
  IF v_evt.bonus_multiplier IS NOT NULL THEN RAISE EXCEPTION 'ALREADY_CLAIMED'; END IF;

  v_payload := COALESCE(v_evt.reward_payload, '{}'::jsonb);
  -- apply policy against base payload already granted at level-up
  -- coins/coin_multiplier with 'multiply' should add only the incremental part: base * (multiplier-1)
  IF v_payload ? 'coins' THEN
    IF coalesce((v_policy->>'coins')::text, 'multiply') = 'multiply' THEN
      v_coins_delta := floor(((v_payload->>'coins')::numeric) * GREATEST(COALESCE(p_bonus_multiplier,1) - 1, 0))::bigint;
    ELSE
      v_coins_delta := (v_payload->>'coins')::bigint;
    END IF;
  END IF;
  IF v_payload ? 'tickets' THEN
    IF coalesce((v_policy->>'tickets')::text, 'add') = 'multiply' THEN
      v_tickets_delta := ((v_payload->>'tickets')::int * GREATEST(COALESCE(p_bonus_multiplier,1) - 1, 0))::int;
    ELSE
      v_tickets_delta := (v_payload->>'tickets')::int;
    END IF;
  END IF;
  IF v_payload ? 'coin_multiplier' THEN
    IF coalesce((v_policy->>'coin_multiplier')::text, 'multiply') = 'multiply' THEN
      v_coin_mult_delta := ((v_payload->>'coin_multiplier')::numeric) * GREATEST(COALESCE(p_bonus_multiplier,1) - 1, 0);
    ELSE
      v_coin_mult_delta := (v_payload->>'coin_multiplier')::numeric;
    END IF;
  END IF;

  IF NOT EXISTS(SELECT 1 FROM reward_events WHERE idempotency_key = p_idempotency_key::text) THEN
    INSERT INTO reward_events(id, user_id, source_type, source_ref_id, base_payload, multiplier_applied, effective_payload, coins_delta, tickets_delta, idempotency_key)
      VALUES (gen_random_uuid(), p_user_id, 'ad_bonus', v_evt.id::text, v_payload, p_bonus_multiplier, v_payload, v_coins_delta, v_tickets_delta, p_idempotency_key::text);
    v_claim_logged := true;
  END IF;

  SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id FOR UPDATE;
  UPDATE level_events SET bonus_multiplier = p_bonus_multiplier WHERE id = v_evt.id;

  -- Apply bonus directly to progression and multiplier
  IF v_claim_logged THEN
    UPDATE user_counters SET coins = COALESCE(user_counters.coins,0) + v_coins_delta,
                             tickets = COALESCE(user_counters.tickets,0) + v_tickets_delta,
                             coin_multiplier = COALESCE(user_counters.coin_multiplier,1.0) + v_coin_mult_delta,
                             updated_at = now()
    WHERE user_id=p_user_id;
  END IF;

  coins := COALESCE(v_counters.coins,0) + CASE WHEN v_claim_logged THEN v_coins_delta ELSE 0 END;
  tickets := COALESCE(v_counters.tickets,0) + CASE WHEN v_claim_logged THEN v_tickets_delta ELSE 0 END;
  coin_multiplier := COALESCE(v_counters.coin_multiplier,1.0) + CASE WHEN v_claim_logged THEN v_coin_mult_delta ELSE 0 END;
  level := COALESCE(v_counters.level,0);
  total_taps := COALESCE(v_counters.total_taps,0);
  RETURN NEXT;
END;$$;

-- add non_progress_coins column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_counters' AND column_name='non_progress_coins') THEN
    ALTER TABLE user_counters ADD COLUMN non_progress_coins bigint default 0;
  END IF;
END $$;
