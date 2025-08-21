# DB models (v1)

## user_profiles
- user_id (PK), created_at, locale, attribution_campaign_id

## user_counters
- user_id (PK), coins (bigint), tickets (int), coin_multiplier (numeric), level (int), total_taps (bigint)
- session_epoch (uuid), current_session_id (uuid), last_applied_seq (bigint), updated_at
 - non_progress_coins (bigint) — present in runtime schema via migrations, reserved for future flows

## tap_batches
- batch_id (PK), user_id, session_id, client_seq, taps, coins_delta, checksum, status, error_code, timestamps
- Purpose: idempotency & audit per micro-batch

## level_events
- id (PK), user_id, level, base_reward, reward_payload (jsonb), bonus_offered, bonus_multiplier, ad_event_id, template_id, created_at

## ad_events
- id (PK), user_id, session_id, provider, placement, status ('closed'|'failed'|'used'|'filled'|'completed'), reward_payload (jsonb), created_at
 - Indexes: `(reward_payload->>'impressionId')` and `(user_id, (reward_payload->>'impressionId'))`

## reward_events (ledger)
- id (PK), user_id, source_type, source_ref_id, base_payload, multiplier_applied, policy_key, effective_payload,
- coins_delta, tickets_delta, coin_multiplier_delta, status, idempotency_key, created_at

## task_definitions / task_progress
- task_definitions: task_id (PK), unlock_level, kind, reward_payload (jsonb), verification, active
- task_progress: user_id + task_id (PK), state, claimed_at

## attribution_leads
- user_id (PK), campaign_id, first_seen_at, meta

## leaderboard_global
- user_id (PK), level, updated_at (refreshed job)

## partner_postbacks
- id (PK), user_id, provider, subid, goal, url, status, http_code, response_hash, attempts, timestamps, unique(user_id,provider,goal)

## active_effects
- effect_id (PK), user_id, type ('coin_multiplier'), magnitude, expires_at, source_reward_event_id (FK), timestamps

RLS: All user-scoped tables restricted by user_id=auth.uid(); mutations only via security-definer RPCs.

Notes on migrations
- The canonical runtime schema includes additive changes in `supabase/migrations/` that extend the baseline documented here. Notable examples:
  - `003_x2_policy_v3.sql` normalizes `ad_events.status` to include `completed` and `used`, adds indexes on impressionId lookup, and introduces `claim_level_bonus_v3` with A‑only TTL gating, idempotency by impressionId, and ad consumption (`used`).
  - `001_hotpath.sql` provides `game_config` defaults, the `_next_threshold` helper, session/tap functions, and ensures `level_events.template_id` exists.
