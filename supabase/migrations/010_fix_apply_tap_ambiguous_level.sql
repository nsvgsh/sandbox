-- Qualify level column reference in apply_tap_batch (ambiguous identifier fix)

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
  v_tickets_base_total int := 0;
  v_cpt int;
  v_eff_mult numeric;
  v_earned_num numeric;
  v_earned bigint;
  v_tpl_payload jsonb;
  v_tpl_id uuid;
  v_reward_coins_total bigint := 0;
  v_reward_tickets_total int := 0;
  v_reward_coin_mult_delta numeric := 0;
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

  select (value::text)::int into v_cpt from game_config where key='coins_per_tap';
  if not found or v_cpt is null then v_cpt := 1; end if;
  v_eff_mult := coalesce(v_counters.coin_multiplier, 1.0);
  v_earned_num := greatest(0, p_taps) * v_cpt * v_eff_mult;
  v_earned := floor(v_earned_num)::bigint;

  v_new_coins := coalesce(v_counters.coins,0) + v_earned;
  v_new_total_taps := coalesce(v_counters.total_taps,0) + greatest(0, p_taps);
  v_level := coalesce(v_counters.level,0);

  select (value->>'base')::int into v_base from game_config where key='thresholds';
  if v_base is null then v_base := 10; end if;
  v_threshold := v_base * (v_level + 1);
  while v_new_coins >= v_threshold loop
    v_new_coins := v_new_coins - v_threshold;
    v_level := v_level + 1;
    v_any_leveled := true;

    select * into v_offer from level_offer_schedule s where s.level = v_level and s.active is true limit 1;
    if found and coalesce(v_offer.skip_base_reward, true) is true then
      insert into level_events(user_id, level, base_reward, reward_payload, bonus_offered, template_id)
        values (p_user_id, v_level, 0, coalesce(v_offer.payload, '{}'::jsonb), false, null);
      v_threshold := v_base * (v_level + 1);
      continue;
    end if;

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
  insert into leaderboard_global(user_id, level, updated_at) values (p_user_id, v_level, now())
    on conflict(user_id) do update set level=excluded.level, updated_at=now();
  next_threshold := _next_threshold(level);
  return next;
end;$$;


