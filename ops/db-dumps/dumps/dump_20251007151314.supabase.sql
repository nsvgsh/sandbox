--
-- Supabase SQL Editor–ready dump
-- Generated at 2025-10-07T15:13:14.504Z
--

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Cleanup — drop objects that will be recreated by this dump
begin;
DO $$ BEGIN
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."_next_threshold"(integer)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."_threshold_for_level"(integer)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."apply_reward_event"(uuid, text, text, jsonb, numeric)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."apply_tap_batch"(uuid, uuid, uuid, uuid, bigint, integer, bigint, text)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."claim_level_bonus"(uuid, integer, numeric, uuid)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."claim_level_bonus_v4"(uuid, integer, numeric, uuid, uuid)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."claim_task"(uuid, uuid)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."claim_task_v2"(uuid, uuid, uuid)'; EXCEPTION WHEN undefined_function THEN END;
  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS "public"."session_start"(uuid)'; EXCEPTION WHEN undefined_function THEN END;
END $$;
DO $$ BEGIN
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."active_effects" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."ad_events" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."attribution_leads" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."dev_whitelist" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."game_config" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."leaderboard_global" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."level_events" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."level_offer_schedule" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."level_reward_templates" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."partner_postbacks" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."reward_events" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."tap_batches" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."task_definitions" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."task_progress" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."telegram_identities" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."user_counters" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP TABLE IF EXISTS "public"."user_profiles" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
END $$;
DO $$ BEGIN
  BEGIN EXECUTE 'DROP SEQUENCE IF EXISTS "public"."level_events_id_seq" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
  BEGIN EXECUTE 'DROP SEQUENCE IF EXISTS "public"."partner_postbacks_id_seq" CASCADE'; EXCEPTION WHEN undefined_table THEN END;
END $$;
commit;

--
-- PostgreSQL database dump
--



-- Dumped from database version 16.10 (Homebrew)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: _next_threshold(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._next_threshold(p_level integer) RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select jsonb_build_object('level', p_level + 1, 'coins', _threshold_for_level(p_level + 1))
$$;


--
-- Name: _threshold_for_level(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public._threshold_for_level(p_level integer) RETURNS bigint
    LANGUAGE sql STABLE
    AS $$
  select floor(
    coalesce(((select value from game_config where key='thresholds_poly') ->> 'a0')::numeric, 156)
    + coalesce(((select value from game_config where key='thresholds_poly') ->> 'a1')::numeric, 800) * (p_level::numeric)
    + coalesce(((select value from game_config where key='thresholds_poly') ->> 'a2')::numeric, 195) * power(p_level::numeric, 2)
    + coalesce(((select value from game_config where key='thresholds_poly') ->> 'a3')::numeric, 7.36) * power(p_level::numeric, 3)
  )::bigint
$$;


--
-- Name: apply_reward_event(uuid, text, text, jsonb, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.apply_reward_event(p_user_id uuid, p_source_type text, p_source_ref text, p_base_payload jsonb, p_multiplier numeric) RETURNS TABLE(coins bigint, tickets integer, coin_multiplier numeric, level integer, total_taps bigint)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: apply_tap_batch(uuid, uuid, uuid, uuid, bigint, integer, bigint, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.apply_tap_batch(p_user_id uuid, p_batch_id uuid, p_session_id uuid, p_session_epoch uuid, p_client_seq bigint, p_taps integer, p_coins_delta bigint, p_checksum text) RETURNS TABLE(coins bigint, tickets integer, coin_multiplier numeric, level integer, total_taps bigint, leveled_up jsonb, next_threshold jsonb)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: claim_level_bonus(uuid, integer, numeric, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_level_bonus(p_user_id uuid, p_level integer, p_bonus_multiplier numeric, p_idempotency_key uuid) RETURNS TABLE(coins bigint, tickets integer, coin_multiplier numeric, level integer, total_taps bigint)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: claim_level_bonus_v4(uuid, integer, numeric, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_level_bonus_v4(p_user_id uuid, p_level integer, p_bonus_multiplier numeric, p_idempotency_key uuid, p_impression_id uuid) RETURNS TABLE(coins bigint, tickets integer, coin_multiplier numeric, level integer, total_taps bigint)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: claim_task(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_task(p_user_id uuid, p_task_id uuid) RETURNS TABLE(state text, coins bigint, tickets integer, coin_multiplier numeric, level integer, total_taps bigint)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: claim_task_v2(uuid, uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.claim_task_v2(p_user_id uuid, p_task_id uuid, p_idempotency_key uuid) RETURNS TABLE(state text, coins bigint, tickets integer, coin_multiplier numeric, level integer, total_taps bigint)
    LANGUAGE plpgsql
    AS $$
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


--
-- Name: session_start(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.session_start(p_user_id uuid) RETURNS TABLE(session_id uuid, session_epoch uuid, last_applied_seq bigint)
    LANGUAGE plpgsql
    AS $$
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: active_effects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_effects (
    effect_id uuid NOT NULL,
    user_id uuid,
    type text,
    magnitude numeric(10,4),
    expires_at timestamp with time zone,
    source_reward_event_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT active_effects_type_check CHECK ((type = 'coin_multiplier'::text))
);


--
-- Name: ad_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ad_events (
    id uuid NOT NULL,
    user_id uuid,
    session_id uuid,
    provider text,
    placement text,
    status text,
    reward_payload jsonb,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT ad_events_status_check CHECK ((status = ANY (ARRAY['closed'::text, 'failed'::text, 'used'::text, 'filled'::text, 'completed'::text])))
);


--
-- Name: attribution_leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attribution_leads (
    user_id uuid NOT NULL,
    campaign_id text,
    first_seen_at timestamp with time zone DEFAULT now(),
    meta jsonb
);


--
-- Name: dev_whitelist; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dev_whitelist (
    tg_user_id bigint NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: game_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.game_config (
    key text NOT NULL,
    value jsonb NOT NULL
);


--
-- Name: leaderboard_global; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leaderboard_global (
    user_id uuid NOT NULL,
    level integer,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: level_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_events (
    id bigint NOT NULL,
    user_id uuid,
    level integer,
    base_reward bigint,
    reward_payload jsonb,
    bonus_offered boolean DEFAULT true,
    bonus_multiplier numeric(10,4),
    ad_event_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    template_id uuid
);


--
-- Name: level_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.level_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: level_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.level_events_id_seq OWNED BY public.level_events.id;


--
-- Name: level_offer_schedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_offer_schedule (
    level integer NOT NULL,
    active boolean DEFAULT true,
    skip_base_reward boolean DEFAULT true,
    partner_key text DEFAULT 'free_trial'::text,
    payload jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    task_id uuid NOT NULL
);


--
-- Name: level_reward_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.level_reward_templates (
    template_id uuid DEFAULT gen_random_uuid() NOT NULL,
    level integer NOT NULL,
    season_id text,
    segment text,
    active boolean DEFAULT true,
    payload jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: partner_postbacks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_postbacks (
    id bigint NOT NULL,
    user_id uuid,
    provider text,
    subid text,
    goal text,
    url text,
    status text DEFAULT 'pending'::text,
    http_code integer,
    response_hash text,
    attempts integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    sent_at timestamp with time zone,
    CONSTRAINT partner_postbacks_provider_check CHECK ((provider = 'propellerads'::text)),
    CONSTRAINT partner_postbacks_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'sent'::text, 'failed'::text, 'duplicate'::text])))
);


--
-- Name: partner_postbacks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_postbacks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_postbacks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_postbacks_id_seq OWNED BY public.partner_postbacks.id;


--
-- Name: reward_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reward_events (
    id uuid NOT NULL,
    user_id uuid,
    source_type text,
    source_ref_id text,
    base_payload jsonb,
    multiplier_applied numeric(10,4),
    policy_key text,
    effective_payload jsonb,
    coins_delta bigint DEFAULT 0,
    tickets_delta integer DEFAULT 0,
    coin_multiplier_delta numeric(10,4) DEFAULT 0,
    status text DEFAULT 'applied'::text,
    idempotency_key text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reward_events_source_type_check CHECK ((source_type = ANY (ARRAY['level_up'::text, 'task_claim'::text, 'ad_bonus'::text, 'admin_grant'::text, 'promo'::text, 'fixup'::text]))),
    CONSTRAINT reward_events_status_check CHECK ((status = ANY (ARRAY['applied'::text, 'rolled_back'::text])))
);


--
-- Name: tap_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tap_batches (
    batch_id uuid NOT NULL,
    user_id uuid,
    session_id uuid,
    client_seq bigint,
    taps integer,
    coins_delta bigint,
    checksum text,
    status text,
    error_code text,
    created_at timestamp with time zone DEFAULT now(),
    applied_at timestamp with time zone,
    CONSTRAINT tap_batches_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'applied'::text, 'dup'::text, 'rejected'::text])))
);


--
-- Name: task_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_definitions (
    task_id uuid NOT NULL,
    unlock_level integer,
    kind text,
    reward_payload jsonb,
    verification text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT task_definitions_kind_check CHECK ((kind = ANY (ARRAY['in_app'::text, 'free-trial'::text, 'social'::text, 'partner'::text]))),
    CONSTRAINT task_definitions_verification_check CHECK ((verification = ANY (ARRAY['none'::text, 'server'::text, 'external'::text])))
);


--
-- Name: task_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.task_progress (
    user_id uuid NOT NULL,
    task_id uuid NOT NULL,
    state text,
    claimed_at timestamp with time zone,
    CONSTRAINT task_progress_state_check CHECK ((state = ANY (ARRAY['locked'::text, 'available'::text, 'claimed'::text])))
);


--
-- Name: telegram_identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.telegram_identities (
    tg_user_id bigint NOT NULL,
    user_id uuid NOT NULL,
    first_name text,
    last_name text,
    username text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_counters (
    user_id uuid NOT NULL,
    coins bigint DEFAULT 0,
    tickets integer DEFAULT 0,
    coin_multiplier numeric(10,4) DEFAULT 1.0,
    level integer DEFAULT 0,
    total_taps bigint DEFAULT 0,
    session_epoch uuid,
    current_session_id uuid,
    last_applied_seq bigint DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now(),
    non_progress_coins bigint DEFAULT 0
);


--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_profiles (
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    locale text,
    attribution_campaign_id text
);


--
-- Name: level_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_events ALTER COLUMN id SET DEFAULT nextval('public.level_events_id_seq'::regclass);


--
-- Name: partner_postbacks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_postbacks ALTER COLUMN id SET DEFAULT nextval('public.partner_postbacks_id_seq'::regclass);


--
-- Data for Name: active_effects; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: ad_events; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: attribution_leads; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: dev_whitelist; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: game_config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.game_config VALUES
	('thresholds_poly', '{"a0": 156, "a1": 800, "a2": 195, "a3": 7.36}'),
	('monetag_enabled', 'true'),
	('monetag_zone_id', '"9667281"'),
	('monetag_sdk_url', '"//munqu.com/sdk.js"'),
	('unlock_policy', '"any"'),
	('log_failed_ad_events', 'true'),
	('free_trial_url_template', '"https://himfls.com/track/Mzc2LjAuMy4zLjAuMC4wLjAuMC4wLjAuMA?_ocid={CLICKID}&aff_subid={SOURCE}"'),
	('free_trial_source', '"tap-app"'),
	('propeller_enabled', 'true'),
	('propeller_postback_base_url', '"http://ad.propellerads.com/conversion.php"'),
	('propeller_aid', '"3857131"'),
	('propeller_tid', '"145944"'),
	('propeller_pid', '""'),
	('ad_ttl_seconds', '10'),
	('coins_per_tap', '100'),
	('hud_tween_ms', '160'),
	('thresholds', '{"base": 10, "growth": "linear", "batch_min_interval_ms": 500}'),
	('tap_agg', '{"tween_ms_max": 180, "tween_ms_min": 80, "flush_threshold": 2}'),
	('ingest', '{"clamp_soft": true, "max_taps_per_batch": 5}'),
	('level_bonus_policy', '{"coins": "multiply", "tickets": "add", "coin_multiplier": "multiply"}');


--
-- Data for Name: leaderboard_global; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: level_events; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: level_offer_schedule; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.level_offer_schedule VALUES
	(1, true, true, 'free_trial', '{}', '2025-10-07 18:13:04.163596+03', 'af3acfd3-6a31-431a-8a37-7a5ddd589271'),
	(4, true, true, 'free_trial', '{}', '2025-10-07 18:13:04.163596+03', '2b9cd4cb-bbbd-49b1-80f6-73ea7955291d'),
	(7, true, true, 'free_trial', '{}', '2025-10-07 18:13:04.163596+03', 'a610e930-96fe-4653-bc40-8707532dd645');


--
-- Data for Name: level_reward_templates; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.level_reward_templates VALUES
	('f8d326e5-5f99-42ff-819a-20bde12a35d6', 1, NULL, NULL, true, '{"coins": 0, "tickets": 11, "coin_multiplier": 1.21}', '2025-10-07 18:13:04.163596+03'),
	('a85d5e32-59dd-4048-9d7f-053744eca90e', 2, NULL, NULL, true, '{"coins": 0, "tickets": 25, "coin_multiplier": 1.28}', '2025-10-07 18:13:04.163596+03'),
	('ecc6dc4f-5e88-46d8-b2e2-113bc9c2726c', 3, NULL, NULL, true, '{"coins": 0, "tickets": 45, "coin_multiplier": 1.35}', '2025-10-07 18:13:04.163596+03'),
	('5e32a26f-26e6-45e6-a2ea-7d37d9242a8e', 4, NULL, NULL, true, '{"coins": 0, "tickets": 69, "coin_multiplier": 1.42}', '2025-10-07 18:13:04.163596+03'),
	('5dcd9155-dd7d-49ec-90d5-1357cd2bb82d', 5, NULL, NULL, true, '{"coins": 0, "tickets": 99, "coin_multiplier": 1.49}', '2025-10-07 18:13:04.163596+03'),
	('c20b252c-2630-4f24-a5f8-e0e35b41aa8a', 6, NULL, NULL, true, '{"coins": 0, "tickets": 135, "coin_multiplier": 1.56}', '2025-10-07 18:13:04.163596+03'),
	('50861057-b913-4538-951a-5373c3866ca1', 7, NULL, NULL, true, '{"coins": 0, "tickets": 175, "coin_multiplier": 1.56}', '2025-10-07 18:13:04.163596+03'),
	('4b08a6f5-dcff-43f1-b62a-1cca11d1082d', 8, NULL, NULL, true, '{"coins": 0, "tickets": 219, "coin_multiplier": 1.63}', '2025-10-07 18:13:04.163596+03'),
	('26272543-7aaa-4c25-a617-52457a871198', 9, NULL, NULL, true, '{"coins": 0, "tickets": 267, "coin_multiplier": 1.7}', '2025-10-07 18:13:04.163596+03'),
	('2a6f6370-9c6c-41ef-a097-e1f635ee3c5d', 10, NULL, NULL, true, '{"coins": 0, "tickets": 321, "coin_multiplier": 1.77}', '2025-10-07 18:13:04.163596+03'),
	('e34a1308-811c-46e8-b4d0-84622c992dad', 11, NULL, NULL, true, '{"coins": 0, "tickets": 381, "coin_multiplier": 1.84}', '2025-10-07 18:13:04.163596+03'),
	('47b0254f-1a6a-48d7-945e-bf32296e2872', 12, NULL, NULL, true, '{"coins": 0, "tickets": 429, "coin_multiplier": 1.91}', '2025-10-07 18:13:04.163596+03'),
	('756f26bc-fe1c-4041-bae1-f97e13610e83', 13, NULL, NULL, true, '{"coins": 0, "tickets": 481, "coin_multiplier": 1.98}', '2025-10-07 18:13:04.163596+03'),
	('fa9a0638-4deb-41c2-b3d9-42b6872c5017', 14, NULL, NULL, true, '{"coins": 0, "tickets": 541, "coin_multiplier": 2.05}', '2025-10-07 18:13:04.163596+03'),
	('46bffb67-dc00-460d-bcff-f96ca1de4147', 15, NULL, NULL, true, '{"coins": 0, "tickets": 609, "coin_multiplier": 2.12}', '2025-10-07 18:13:04.163596+03');


--
-- Data for Name: partner_postbacks; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: reward_events; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tap_batches; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: task_definitions; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.task_definitions VALUES
	('d2902150-9357-4f8e-bb57-0921d1ee034c', 1, 'in_app', '{"tickets": 2, "coin_multiplier": 1.21}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('719ce2a5-092f-4836-bc7b-64beddeb8470', 1, 'free-trial', '{"tickets": 3, "coin_multiplier": 1.23}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('b2e156d1-50f6-4a0a-882e-56c25925127e', 1, 'in_app', '{"tickets": 2, "coin_multiplier": 1.21}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('feeaf6d4-e80f-4ed1-9e07-4191f574b666', 2, 'in_app', '{"tickets": 3, "coin_multiplier": 1.29}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('0e9b2f82-2879-4a93-a30e-bf6f9a30f564', 3, 'in_app', '{"tickets": 4, "coin_multiplier": 1.37}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('aaf10783-5bf3-4d9e-8b5f-608c2ecf4358', 4, 'free-trial', '{"tickets": 7, "coin_multiplier": 1.45}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('662e1f18-b655-4701-9106-d02075ca8c14', 5, 'in_app', '{"tickets": 8, "coin_multiplier": 1.53}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('7c5cc354-0065-4439-9286-f6af2c9d8173', 6, 'in_app', '{"tickets": 9, "coin_multiplier": 1.61}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('6864dab3-77c4-4c42-865e-644ff8cd72db', 7, 'free-trial', '{"tickets": 12, "coin_multiplier": 1.59}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('34f93117-b5ea-40e5-9afc-80eb05aa3419', 8, 'in_app', '{"tickets": 12, "coin_multiplier": 1.64}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('892746dc-a74b-4856-b930-f8415e3772b0', 9, 'in_app', '{"tickets": 12, "coin_multiplier": 1.72}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('a4c51428-a729-46f5-acf6-2c4bf0729ebc', 10, 'in_app', '{"tickets": 12, "coin_multiplier": 1.81}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('ed32bc5e-9119-4afa-bfc2-128d75254590', 11, 'in_app', '{"tickets": 12, "coin_multiplier": 1.9}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('9c96b4b0-8b75-429e-9624-d3cdc322fb62', 12, 'in_app', '{"tickets": 12, "coin_multiplier": 1.99}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('37db64b3-c3a2-4f8d-b165-2e9cbf83e861', 13, 'in_app', '{"tickets": 12, "coin_multiplier": 2.09}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('d77d227c-f88e-4f9f-9b09-d7f4fd0998f2', 14, 'in_app', '{"tickets": 12, "coin_multiplier": 2.19}', 'none', true, '2025-10-07 18:13:04.163596+03'),
	('587b3029-1f15-4e8e-ba38-e7763238834c', 15, 'in_app', '{"tickets": 12, "coin_multiplier": 2.29}', 'none', true, '2025-10-07 18:13:04.163596+03');


--
-- Data for Name: task_progress; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: telegram_identities; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_counters; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: level_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.level_events_id_seq', 1, false);


--
-- Name: partner_postbacks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_postbacks_id_seq', 1, false);


--
-- Name: active_effects active_effects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_effects
    ADD CONSTRAINT active_effects_pkey PRIMARY KEY (effect_id);


--
-- Name: active_effects active_effects_user_id_type_source_reward_event_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_effects
    ADD CONSTRAINT active_effects_user_id_type_source_reward_event_id_key UNIQUE (user_id, type, source_reward_event_id);


--
-- Name: ad_events ad_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_events
    ADD CONSTRAINT ad_events_pkey PRIMARY KEY (id);


--
-- Name: attribution_leads attribution_leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attribution_leads
    ADD CONSTRAINT attribution_leads_pkey PRIMARY KEY (user_id);


--
-- Name: dev_whitelist dev_whitelist_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dev_whitelist
    ADD CONSTRAINT dev_whitelist_pkey PRIMARY KEY (tg_user_id);


--
-- Name: game_config game_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.game_config
    ADD CONSTRAINT game_config_pkey PRIMARY KEY (key);


--
-- Name: leaderboard_global leaderboard_global_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_global
    ADD CONSTRAINT leaderboard_global_pkey PRIMARY KEY (user_id);


--
-- Name: level_events level_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_events
    ADD CONSTRAINT level_events_pkey PRIMARY KEY (id);


--
-- Name: level_offer_schedule level_offer_schedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_offer_schedule
    ADD CONSTRAINT level_offer_schedule_pkey PRIMARY KEY (level);


--
-- Name: level_offer_schedule level_offer_schedule_task_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_offer_schedule
    ADD CONSTRAINT level_offer_schedule_task_id_key UNIQUE (task_id);


--
-- Name: level_reward_templates level_reward_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_reward_templates
    ADD CONSTRAINT level_reward_templates_pkey PRIMARY KEY (template_id);


--
-- Name: partner_postbacks partner_postbacks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_postbacks
    ADD CONSTRAINT partner_postbacks_pkey PRIMARY KEY (id);


--
-- Name: partner_postbacks partner_postbacks_user_id_provider_goal_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_postbacks
    ADD CONSTRAINT partner_postbacks_user_id_provider_goal_key UNIQUE (user_id, provider, goal);


--
-- Name: reward_events reward_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_events
    ADD CONSTRAINT reward_events_pkey PRIMARY KEY (id);


--
-- Name: tap_batches tap_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tap_batches
    ADD CONSTRAINT tap_batches_pkey PRIMARY KEY (batch_id);


--
-- Name: task_definitions task_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_definitions
    ADD CONSTRAINT task_definitions_pkey PRIMARY KEY (task_id);


--
-- Name: task_progress task_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_progress
    ADD CONSTRAINT task_progress_pkey PRIMARY KEY (user_id, task_id);


--
-- Name: telegram_identities telegram_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_identities
    ADD CONSTRAINT telegram_identities_pkey PRIMARY KEY (tg_user_id);


--
-- Name: user_counters user_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_counters
    ADD CONSTRAINT user_counters_pkey PRIMARY KEY (user_id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: idx_ad_events_impression; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_events_impression ON public.ad_events USING btree (((reward_payload ->> 'impressionId'::text)));


--
-- Name: idx_ad_events_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_events_user_created ON public.ad_events USING btree (user_id, created_at DESC);


--
-- Name: idx_ad_events_user_impression; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_events_user_impression ON public.ad_events USING btree (user_id, ((reward_payload ->> 'impressionId'::text)));


--
-- Name: idx_ad_events_user_intent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ad_events_user_intent ON public.ad_events USING btree (user_id, status, ((reward_payload ->> 'intent'::text)));


--
-- Name: idx_leaderboard_level; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leaderboard_level ON public.leaderboard_global USING btree (level DESC);


--
-- Name: idx_level_events_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_level_events_user_created ON public.level_events USING btree (user_id, created_at DESC);


--
-- Name: idx_partner_postbacks_user_provider_goal; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_postbacks_user_provider_goal ON public.partner_postbacks USING btree (user_id, provider, goal);


--
-- Name: idx_tap_batches_user_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tap_batches_user_created ON public.tap_batches USING btree (user_id, created_at);


--
-- Name: idx_tap_batches_user_seq; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tap_batches_user_seq ON public.tap_batches USING btree (user_id, client_seq);


--
-- Name: idx_telegram_identities_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_telegram_identities_user ON public.telegram_identities USING btree (user_id);


--
-- Name: uq_level_reward_templates_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_level_reward_templates_active ON public.level_reward_templates USING btree (COALESCE(season_id, '*'::text), COALESCE(segment, '*'::text), level) WHERE (active IS TRUE);


--
-- Name: active_effects active_effects_source_reward_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_effects
    ADD CONSTRAINT active_effects_source_reward_event_id_fkey FOREIGN KEY (source_reward_event_id) REFERENCES public.reward_events(id);


--
-- Name: active_effects active_effects_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_effects
    ADD CONSTRAINT active_effects_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: ad_events ad_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ad_events
    ADD CONSTRAINT ad_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: attribution_leads attribution_leads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attribution_leads
    ADD CONSTRAINT attribution_leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: leaderboard_global leaderboard_global_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leaderboard_global
    ADD CONSTRAINT leaderboard_global_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: level_events level_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.level_events
    ADD CONSTRAINT level_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: partner_postbacks partner_postbacks_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_postbacks
    ADD CONSTRAINT partner_postbacks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: reward_events reward_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_events
    ADD CONSTRAINT reward_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: tap_batches tap_batches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tap_batches
    ADD CONSTRAINT tap_batches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: task_progress task_progress_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_progress
    ADD CONSTRAINT task_progress_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.task_definitions(task_id);


--
-- Name: task_progress task_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.task_progress
    ADD CONSTRAINT task_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: telegram_identities telegram_identities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.telegram_identities
    ADD CONSTRAINT telegram_identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- Name: user_counters user_counters_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_counters
    ADD CONSTRAINT user_counters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(user_id);


--
-- PostgreSQL database dump complete
--



