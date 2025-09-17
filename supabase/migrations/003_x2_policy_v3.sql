-- Normalize ad_events.status to include 'completed' and 'used'
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_table_usage ctu ON cc.constraint_name = ctu.constraint_name
    WHERE ctu.table_name='ad_events' AND cc.check_clause LIKE '%status%'
  ) THEN
    BEGIN
      ALTER TABLE ad_events DROP CONSTRAINT IF EXISTS ad_events_status_check;
    EXCEPTION WHEN undefined_object THEN
      -- ignore
    END;
  END IF;
END $$;

DO $$ BEGIN
  -- ensure any previous constraint variant is removed
  BEGIN
    ALTER TABLE ad_events DROP CONSTRAINT IF EXISTS ad_events_status_check;
  EXCEPTION WHEN undefined_object THEN
  END;

  -- add only if it does not already exist
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    WHERE r.relname = 'ad_events' AND c.conname = 'ad_events_status_check'
  ) THEN
    ALTER TABLE ad_events
      ADD CONSTRAINT ad_events_status_check CHECK (status IN ('filled','closed','failed','completed','used'));
  END IF;
END $$;

-- Indexes to speed up impression lookups
CREATE INDEX IF NOT EXISTS idx_ad_events_impression ON ad_events ((reward_payload->>'impressionId'));
CREATE INDEX IF NOT EXISTS idx_ad_events_user_impression ON ad_events (user_id, (reward_payload->>'impressionId'));

-- claim_level_bonus_v3: A-only (ad_ttl_seconds) gating; no claim_ttl_seconds checks
CREATE OR REPLACE FUNCTION claim_level_bonus_v3(
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
  v_coin_mult_delta numeric := 0;
  v_counters user_counters%rowtype;
  v_claim_logged boolean := false;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  -- Identify latest eligible level event for this level
  SELECT * INTO v_evt
  FROM level_events
  WHERE user_id = p_user_id AND level_events.level = p_level
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  IF v_evt.bonus_multiplier IS NOT NULL THEN RAISE EXCEPTION 'ALREADY_CLAIMED'; END IF;

  -- Validate ad recency by impressionId within ad_ttl_seconds (A)
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

  -- Compute incremental payload according to policy (coins/tickets/coin_multiplier)
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
  IF v_payload ? 'coin_multiplier' THEN
    IF COALESCE((v_policy->>'coin_multiplier')::text, 'multiply') = 'multiply' THEN
      v_coin_mult_delta := ((v_payload->>'coin_multiplier')::numeric) * GREATEST(COALESCE(p_bonus_multiplier,1) - 1, 0);
    ELSE
      v_coin_mult_delta := (v_payload->>'coin_multiplier')::numeric;
    END IF;
  END IF;

  -- Idempotency by p_idempotency_key
  IF NOT EXISTS(SELECT 1 FROM reward_events WHERE idempotency_key = p_idempotency_key::text) THEN
    INSERT INTO reward_events(id, user_id, source_type, source_ref_id, base_payload, multiplier_applied, effective_payload, coins_delta, tickets_delta, idempotency_key)
      VALUES (gen_random_uuid(), p_user_id, 'ad_bonus', v_evt.id::text, v_payload, p_bonus_multiplier, v_payload, v_coins_delta, v_tickets_delta, p_idempotency_key::text);
    v_claim_logged := true;
  END IF;

  SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id FOR UPDATE;
  UPDATE level_events SET bonus_multiplier = p_bonus_multiplier WHERE id = v_evt.id;

  IF v_claim_logged THEN
    UPDATE user_counters SET coins = COALESCE(user_counters.coins,0) + v_coins_delta,
                             tickets = COALESCE(user_counters.tickets,0) + v_tickets_delta,
                             coin_multiplier = COALESCE(user_counters.coin_multiplier,1.0) + v_coin_mult_delta,
                             updated_at = now()
    WHERE user_id=p_user_id;

    -- mark ad as used
    IF v_ad_id IS NOT NULL THEN
      UPDATE ad_events SET status = 'used' WHERE id = v_ad_id;
    END IF;
  END IF;

  coins := COALESCE(v_counters.coins,0) + CASE WHEN v_claim_logged THEN v_coins_delta ELSE 0 END;
  tickets := COALESCE(v_counters.tickets,0) + CASE WHEN v_claim_logged THEN v_tickets_delta ELSE 0 END;
  coin_multiplier := COALESCE(v_counters.coin_multiplier,1.0) + CASE WHEN v_claim_logged THEN v_coin_mult_delta ELSE 0 END;
  level := COALESCE(v_counters.level,0);
  total_taps := COALESCE(v_counters.total_taps,0);
  RETURN NEXT;
END;$$;


