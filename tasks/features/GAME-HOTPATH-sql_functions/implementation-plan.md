# Implementation Plan — GAME-HOTPATH

## SQL objects
- Table: `game_config(key text primary key, value jsonb)`; seed thresholds/policies.
- Functions:
  - `session_start(p_user_id uuid) returns table(session_id uuid, session_epoch uuid, last_applied_seq bigint)`
  - `apply_tap_batch(p_user_id uuid, p_batch_id uuid, p_session_id uuid, p_session_epoch uuid, p_client_seq bigint, p_taps int, p_coins_delta bigint, p_checksum text)
     returns table(coins bigint, tickets int, coin_multiplier numeric, level int, total_taps bigint, leveled_up jsonb, next_threshold jsonb)`

## Steps
1) Write SQL for table + functions with transactions, locks, and basic guards.
2) Apply SQL to local Postgres.
3) Update API:
   - POST /api/v1/session/start → calls `session_start` with user id.
   - POST /api/v1/ingest/taps → calls `apply_tap_batch` with header/body args.
4) Verify flows; log errors with structured codes.
5) Commit and update CHANGELOG.

## Notes
- Keep function signatures prod-ready for Supabase RPC.
- Leave `apply_reward_event` and others for the next feature ticket.
