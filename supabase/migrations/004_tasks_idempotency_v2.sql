-- claim_task_v2: idempotent by idempotency key; applies reward once; returns counters
CREATE OR REPLACE FUNCTION claim_task_v2(
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
  v_coin_mult_delta numeric := 0;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));
  SELECT * INTO v_def FROM task_definitions WHERE task_id=p_task_id FOR UPDATE;
  IF NOT FOUND OR v_def.active IS NOT TRUE THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  SELECT * INTO v_prog FROM task_progress WHERE user_id=p_user_id AND task_id=p_task_id FOR UPDATE;
  IF FOUND AND v_prog.state = 'claimed' THEN RAISE EXCEPTION 'ALREADY_CLAIMED'; END IF;

  -- For v2 we still require verification='none' like v1
  IF v_def.verification <> 'none' THEN RAISE EXCEPTION 'VERIFICATION_REQUIRED'; END IF;

  v_reward := COALESCE(v_def.reward_payload, '{}'::jsonb);
  -- Mark claimed state (idempotency will gate reward application below)
  UPDATE task_progress SET state='claimed', claimed_at=now() WHERE user_id=p_user_id AND task_id=p_task_id;
  IF NOT FOUND THEN
    INSERT INTO task_progress(user_id, task_id, state, claimed_at) VALUES (p_user_id, p_task_id, 'claimed', now());
  END IF;

  -- Apply reward only once per idempotency key (inline to set the provided key)
  IF NOT EXISTS (SELECT 1 FROM reward_events WHERE idempotency_key = p_idempotency_key::text) THEN
    v_coins_delta := COALESCE((v_reward->>'coins')::bigint, 0);
    v_tickets_delta := COALESCE((v_reward->>'tickets')::int, 0);
    v_coin_mult_delta := COALESCE((v_reward->>'coin_multiplier')::numeric, 0);

    SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id FOR UPDATE;

    INSERT INTO reward_events(
      id, user_id, source_type, source_ref_id,
      base_payload, multiplier_applied, effective_payload,
      coins_delta, tickets_delta, coin_multiplier_delta, idempotency_key
    ) VALUES (
      gen_random_uuid(), p_user_id, 'task_claim', p_task_id::text,
      v_reward, NULL, v_reward,
      v_coins_delta, v_tickets_delta, v_coin_mult_delta, p_idempotency_key::text
    );

    UPDATE user_counters SET
      coins = COALESCE(user_counters.coins,0) + v_coins_delta,
      tickets = COALESCE(user_counters.tickets,0) + v_tickets_delta,
      coin_multiplier = COALESCE(user_counters.coin_multiplier,1.0) + v_coin_mult_delta,
      updated_at = now()
    WHERE user_id = p_user_id;

    v_claim_logged := true;
  END IF;

  -- Read current counters for return
  SELECT * INTO v_counters FROM user_counters WHERE user_id=p_user_id;
  state := 'claimed';
  coins := COALESCE(v_counters.coins,0);
  tickets := COALESCE(v_counters.tickets,0);
  coin_multiplier := COALESCE(v_counters.coin_multiplier,1.0);
  level := COALESCE(v_counters.level,0);
  total_taps := COALESCE(v_counters.total_taps,0);
  RETURN NEXT;
END;$$;


