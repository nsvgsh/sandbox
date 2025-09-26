-- MULT-ABS-SET: Treat coin_multiplier in payloads as ABSOLUTE SET everywhere.
-- Also ensure x2 bonus does not affect coin_multiplier (only coins/tickets).

-- 1) apply_tap_batch: set coin_multiplier to last non-null payload value across level-ups
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
  v_any_leveled boolean := false;
  v_threshold bigint;
  v_cpt int;
  v_eff_mult numeric;
  v_earned_num numeric;
  v_earned bigint;
  v_tpl_payload jsonb;
  v_tpl_id uuid;
  v_reward_coins_total bigint := 0;
  v_reward_tickets_total int := 0;
  v_reward_coin_mult_abs numeric := null; -- NEW: last absolute multiplier from level payloads in this batch
  v_offer record;
begin
  if exists(select 1 from tap_batches where user_id=p_user_id and batch_id=p_batch_id) then
    select * into v_counters from user_counters where user_id=p_user_id;
    coins := v_counters.coins; tickets := v_counters.tickets; coin_multiplier := v_counters.coin_multiplier; level := v_counters.level; total_taps := v_counters.total_taps;
    leveled_up := null; next_threshold := _next_threshold(level);
    return next; return;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  select * into v_counters from user_counters where user_id=p_user_id for update;
  declare v_min_ms int; begin
    select coalesce((value->>'batch_min_interval_ms')::int, 100) into v_min_ms from game_config where key='thresholds';
    if v_counters.updated_at is not null and (extract(epoch from (now() - v_counters.updated_at))*1000) < v_min_ms then
      raise exception 'RATE_LIMITED';
    end if;
  end;
  if not found then raise exception 'USER_NOT_INITIALIZED'; end if;

  if v_counters.session_epoch is distinct from p_session_epoch then raise exception 'SUPERSEDED'; end if;
  v_prev_seq := coalesce(v_counters.last_applied_seq, 0);
  if p_client_seq < v_prev_seq then raise exception 'SEQ_REWIND'; end if;

  -- compute earned coins (server-side)
  select (value::text)::int into v_cpt from game_config where key='coins_per_tap';
  if not found or v_cpt is null then v_cpt := 1; end if;
  v_eff_mult := coalesce(v_counters.coin_multiplier, 1.0);
  v_earned_num := greatest(0, p_taps) * v_cpt * v_eff_mult;
  v_earned := floor(v_earned_num)::bigint;

  v_new_coins := coalesce(v_counters.coins,0) + v_earned;
  v_new_total_taps := coalesce(v_counters.total_taps,0) + greatest(0, p_taps);
  v_level := coalesce(v_counters.level,0);

  -- level-up loop with polynomial threshold; collect absolute multiplier if present
  v_threshold := _threshold_for_level(v_level + 1);
  while v_new_coins >= v_threshold loop
    v_level := v_level + 1;
    v_any_leveled := true;

    -- Free Trial schedule: optional skip base reward
    select * into v_offer from level_offer_schedule s where s.level = v_level and s.active is true limit 1;
    if found and coalesce(v_offer.skip_base_reward, true) is true then
      insert into level_events(user_id, level, base_reward, reward_payload, bonus_offered, template_id)
        values (p_user_id, v_level, 0, coalesce(v_offer.payload, '{}'::jsonb), false, null);
      v_threshold := _threshold_for_level(v_level + 1);
      continue;
    end if;

    -- resolve per-level template (fallback to level=0)
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
    if v_tpl_payload is null then v_tpl_payload := '{"tickets":3}'::jsonb; end if;
    declare v_base_coins bigint := coalesce((v_tpl_payload->>'coins')::bigint, 0);
            v_base_tickets int := coalesce((v_tpl_payload->>'tickets')::int, 0);
            v_base_coin_mult_abs numeric := (v_tpl_payload->>'coin_multiplier')::numeric;
    begin
      v_reward_coins_total := v_reward_coins_total + v_base_coins;
      v_reward_tickets_total := v_reward_tickets_total + v_base_tickets;
      if v_base_coin_mult_abs is not null then
        v_reward_coin_mult_abs := v_base_coin_mult_abs; -- last one wins
      end if;
      insert into level_events(user_id, level, base_reward, reward_payload, bonus_offered, template_id)
        values (p_user_id, v_level, v_base_coins, v_tpl_payload, true, v_tpl_id);
    end;
    v_threshold := _threshold_for_level(v_level + 1);
  end loop;

  update user_counters set coins = v_new_coins + v_reward_coins_total,
                           tickets = COALESCE(user_counters.tickets,0) + v_reward_tickets_total,
                           coin_multiplier = COALESCE(v_reward_coin_mult_abs, user_counters.coin_multiplier),
                           total_taps = v_new_total_taps,
                           level = v_level,
                           last_applied_seq = p_client_seq,
                           updated_at = now()
  where user_id = p_user_id;

  insert into tap_batches(batch_id, user_id, session_id, client_seq, taps, coins_delta, checksum, status)
  values(p_batch_id, p_user_id, p_session_id, p_client_seq, p_taps, p_coins_delta, p_checksum, 'applied');

  coins := v_new_coins + v_reward_coins_total;
  tickets := coalesce(v_counters.tickets,0) + v_reward_tickets_total;
  coin_multiplier := COALESCE(v_reward_coin_mult_abs, v_counters.coin_multiplier);
  level := v_level;
  total_taps := v_new_total_taps;
  leveled_up := case when v_any_leveled then jsonb_build_object('level', v_level) else null end;
  insert into leaderboard_global(user_id, level, updated_at) values (p_user_id, v_level, now())
    on conflict(user_id) do update set level=excluded.level, updated_at=now();
  next_threshold := _next_threshold(level);
  return next;
end;$$;

-- 2) claim_task_v2: treat coin_multiplier as absolute set, not delta
create or replace function claim_task_v2(
  p_user_id uuid,
  p_task_id uuid,
  p_idempotency_key uuid
) RETURNS TABLE(
  state text,
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint
) LANGUAGE plpgsql AS $$
DECLARE
  v_def task_definitions%rowtype;
  v_prog task_progress%rowtype;
  v_reward jsonb := '{}'::jsonb;
  v_counters user_counters%rowtype;
  v_claim_logged boolean := false;
  v_coins_delta bigint := 0;
  v_tickets_delta int := 0;
  v_coin_mult_abs numeric := null;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
  SELECT * INTO v_def FROM task_definitions WHERE task_id=p_task_id FOR UPDATE;
  IF NOT FOUND OR v_def.active IS NOT TRUE THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  SELECT * INTO v_prog FROM task_progress WHERE user_id=p_user_id AND task_id=p_task_id FOR UPDATE;
  IF FOUND AND v_prog.state = 'claimed' THEN RAISE EXCEPTION 'ALREADY_CLAIMED'; END IF;

  IF v_def.verification <> 'none' THEN RAISE EXCEPTION 'VERIFICATION_REQUIRED'; END IF;

  v_reward := COALESCE(v_def.reward_payload, '{}'::jsonb);
  UPDATE task_progress SET state='claimed', claimed_at=now() WHERE user_id=p_user_id AND task_id=p_task_id;
  IF NOT FOUND THEN
    INSERT INTO task_progress(user_id, task_id, state, claimed_at) VALUES (p_user_id, p_task_id, 'claimed', now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM reward_events WHERE idempotency_key = p_idempotency_key::text) THEN
    v_coins_delta := COALESCE((v_reward->>'coins')::bigint, 0);
    v_tickets_delta := COALESCE((v_reward->>'tickets')::int, 0);
    v_coin_mult_abs := (v_reward->>'coin_multiplier')::numeric;

    SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id FOR UPDATE;

    INSERT INTO reward_events(
      id, user_id, source_type, source_ref_id,
      base_payload, multiplier_applied, effective_payload,
      coins_delta, tickets_delta, coin_multiplier_delta, idempotency_key
    ) VALUES (
      gen_random_uuid(), p_user_id, 'task_claim', p_task_id::text,
      v_reward, NULL, v_reward,
      v_coins_delta, v_tickets_delta, 0, p_idempotency_key::text
    );

    UPDATE user_counters SET
      coins = COALESCE(user_counters.coins,0) + v_coins_delta,
      tickets = COALESCE(user_counters.tickets,0) + v_tickets_delta,
      coin_multiplier = COALESCE(v_coin_mult_abs, user_counters.coin_multiplier),
      updated_at = now()
    WHERE user_id = p_user_id;

    v_claim_logged := true;
  END IF;

  SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id;
  state := 'claimed';
  coins := COALESCE(v_counters.coins,0);
  tickets := COALESCE(v_counters.tickets,0);
  coin_multiplier := COALESCE(v_counters.coin_multiplier,1.0);
  level := COALESCE(v_counters.level,0);
  total_taps := COALESCE(v_counters.total_taps,0);
  RETURN NEXT;
END;$$;

-- 3) claim_level_bonus_v4: ignore coin_multiplier (x2 only affects coins/tickets)
create or replace function claim_level_bonus_v4(
  p_user_id uuid,
  p_level int,
  p_bonus_multiplier numeric,
  p_idempotency_key uuid,
  p_impression_id uuid
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
  v_ad_id uuid;
  v_ad_created timestamptz;
  v_ttl int := 180;
  v_policy jsonb := (select value from game_config where key='level_bonus_policy');
  v_coins_delta bigint := 0;
  v_tickets_delta int := 0;
  v_coin_mult_delta numeric := 0; -- forced zero
  v_counters user_counters%rowtype;
  v_claim_logged boolean := false;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  SELECT * INTO v_evt
  FROM level_events
  WHERE user_id = p_user_id AND level_events.level = p_level
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  SELECT COALESCE((value)::int, 180) INTO v_ttl FROM game_config WHERE key='ad_ttl_seconds';
  SELECT id, created_at INTO v_ad_id, v_ad_created
  FROM ad_events
  WHERE user_id = p_user_id
    AND status = 'completed'
    AND (reward_payload->>'impressionId') = p_impression_id::text
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'TTL_EXPIRED'; END IF;
  IF EXTRACT(EPOCH FROM (v_now - v_ad_created)) > v_ttl THEN RAISE EXCEPTION 'TTL_EXPIRED'; END IF;

  v_payload := COALESCE(v_evt.reward_payload, '{}'::jsonb);

  -- Compute incremental payload for x2 (coins/tickets only)
  IF v_payload ? 'coins' THEN
    IF COALESCE((v_policy->>'coins')::text, 'multiply') = 'multiply' THEN
      v_coins_delta := floor(((v_payload->>'coins')::numeric) * GREATEST(COALESCE(p_bonus_multiplier,1) - 1, 0))::bigint;
    ELSE
      v_coins_delta := (v_payload->>'coins')::bigint;
    END IF;
  END IF;
  IF v_payload ? 'tickets' THEN
    IF COALESCE((v_policy->>'tickets')::text, 'add') = 'multiply' THEN
      v_tickets_delta := ((v_payload->>'tickets')::int * GREATEST(COALESCE(p_bonus_multiplier,1) - 1, 0))::int;
    ELSE
      v_tickets_delta := (v_payload->>'tickets')::int;
    END IF;
  END IF;
  -- coin_multiplier is ignored for x2 in ABS mode
  v_coin_mult_delta := 0;

  -- Idempotency & apply
  IF NOT EXISTS(SELECT 1 FROM reward_events WHERE idempotency_key = p_idempotency_key::text) THEN
    INSERT INTO reward_events(id, user_id, source_type, source_ref_id, base_payload, multiplier_applied, effective_payload, coins_delta, tickets_delta, coin_multiplier_delta, idempotency_key)
      VALUES (gen_random_uuid(), p_user_id, 'ad_bonus', v_evt.id::text, v_payload, p_bonus_multiplier, v_payload, v_coins_delta, v_tickets_delta, 0, p_idempotency_key::text);
    v_claim_logged := true;
  END IF;

  SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id FOR UPDATE;
  UPDATE level_events SET bonus_multiplier = p_bonus_multiplier WHERE id = v_evt.id;

  IF v_claim_logged THEN
    UPDATE user_counters SET coins = COALESCE(user_counters.coins,0) + v_coins_delta,
                             tickets = COALESCE(user_counters.tickets,0) + v_tickets_delta,
                             updated_at = now()
    WHERE user_id=p_user_id;

    IF v_ad_id IS NOT NULL THEN
      UPDATE ad_events SET status = 'used' WHERE id = v_ad_id;
    END IF;
  END IF;

  coins := COALESCE(v_counters.coins,0) + CASE WHEN v_claim_logged THEN v_coins_delta ELSE 0 END;
  tickets := COALESCE(v_counters.tickets,0) + CASE WHEN v_claim_logged THEN v_tickets_delta ELSE 0 END;
  coin_multiplier := COALESCE(v_counters.coin_multiplier,1.0);
  level := COALESCE(v_counters.level,0);
  total_taps := COALESCE(v_counters.total_taps,0);
  RETURN NEXT;
END;$$;


