# TAP-LADDER-0001 – Precomputed ladder + FIFO modals

## What
- Implement a client-side decisioning model for level-ups and reward modals driven by a precomputed ladder (thresholds + modal intents), with a strict FIFO modal queue (never merge), and immediate optimistic HUD coins.
- Add a read-only server endpoint to deliver a session-scoped config snapshot needed to build the ladder.

## Why
- Remove decision latency and flakiness: avoid per-event fetches and handle overshoot/mid-modal level-ups deterministically.
- Preserve server authority: reconcile on acks; absolute multiplier applies after server confirmation.
- Align with current DB-driven design (`game_config`, `level_reward_templates`, `level_offer_schedule`) and keep migrations unchanged.

## Scope
- Server: new `GET /api/v1/config/snapshot` (no write paths changed).
- Client: build ladder window locally; detect threshold crossings using optimistic HUD; append one modal per crossed level (FIFO). Rebase UI on `apply_tap_batch` and `claim_level_bonus_v4` responses.

## Success Criteria
- Zero-latency modal decisions; HUD coins update immediately on taps.
- Correct handling of: overshoot across multiple levels, slow ack, mid-modal new level-ups, x2 ad bonus flow.
- No changes to `apply_tap_batch` behavior or guards.


