# GD-ALIGN-HIPRI — Align implementation with game-design v1

## WHAT
Bring the local playable loop and server logic in line with `docs/game-design.md`:
- Server-authoritative tap earnings (taps × coins_per_tap × coin_multiplier); client no longer sends coinsDelta.
- Thresholds from config (base=10); unified next-threshold across endpoints.
- Per-level reward templates; base reward granted immediately on level-up; ad-gated bonus applies only the incremental portion.
- Tasks as ad-views with unlock gating; claim requires a recent ad; idempotent.
- Leaderboard returns `me` rank and `activePlayers`.
- Dev admin/debug surfaces to inspect config, templates, and state (dev-only).

## WHY
- Match the documented core loop and reward policy while enabling fast iteration locally.
- Prevent client tampering; centralize balancing in DB/config; improve observability.

## ACCEPTANCE
- Tapping updates counters server-side; level-ups consume coins and return `leveledUp` and `nextThreshold`.
- On level-up, a `level_event` is created with a template snapshot; base reward is granted immediately.
- Posting `/api/v1/ad/log` within TTL auto-applies the incremental bonus for the latest level-up (idempotent by impressionId).
- `GET /tasks` returns unlock-gated states; `POST /tasks/{id}/claim` enforces a recent ad and updates counters.
- `GET /leaderboard` returns `{ top, me, activePlayers }`.
