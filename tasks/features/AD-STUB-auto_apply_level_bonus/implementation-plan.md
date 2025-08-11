# Implementation Plan — AD-STUB

## Architectural Analysis
- Keep the flow entirely server-side; impressionId serves as idempotency key.

## Task List
- `/api/v1/ad/log`: insert into `ad_events`, apply `claim_level_bonus(user, level, multiplier, impressionId)` if eligible; mark ad as used later if needed.
- Config: `ad_ttl_seconds` and caps in `game_config`.
- DB: allow ad_events.status to include 'completed' (local stub).

## Documentation Impact
- Update `docs/api-contracts.md` and `docs/db-schema.sql` for ad_events statuses and the stub flow.
