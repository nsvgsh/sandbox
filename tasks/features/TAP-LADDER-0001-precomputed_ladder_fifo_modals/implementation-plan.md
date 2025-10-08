# TAP-LADDER-0001 – Implementation Plan

## Architectural Analysis
- Server remains authoritative; no changes to `apply_tap_batch`, `claim_level_bonus_v4`, or schema.
- Add snapshot endpoint to expose only active config needed for client ladder: `coins_per_tap`, `thresholds_poly`, `level_reward_templates` (active), `level_offer_schedule` (active), `ingest`, `tap_agg`, `level_bonus_policy`, `ad_ttl_seconds`, `claim_ttl_seconds`.
- Client computes a rolling ladder window from the snapshot and acked baseline; HUD coins update immediately (optimistic, taps-only), thresholds crossing is determined locally; one modal per crossed level is appended to a FIFO queue; no modal merging.
- Rebase triggers: `apply_tap_batch` (applied) and successful `claim_level_bonus_v4`.

## Tasks
1) API: `GET /api/v1/config/snapshot`
   - Shape: `{ configVersion, coinsPerTap, thresholdsPoly, levelRewardTemplates, levelOfferSchedule, ingest, tapAgg, policy: { levelBonus, ad_ttl_seconds, claim_ttl_seconds } }`.
   - Compute `configVersion` as a stable hash over payload.
2) Client modules
   - `lib/ladder.ts`: `_threshold_for_level` parity (polynomial + floor); `buildLadderWindow(...)`; `crossedLevels(prevCoins, currCoins, ladder)`; `nextThreshold(level)`. Unit tests.
   - `lib/modalQueue.ts`: append-only FIFO with `enqueue`, `peek`, `dequeue`, `size`. Unit tests.
3) Wire into `web/src/app/page.tsx`
   - On session start/claim: fetch counters, then snapshot; build ladder window.
   - On tap: update `displayCoins`; detect crossings via ladder; enqueue modals; flush per existing policy.
   - On ack: rebase counters, refresh ladder window; do not alter current modal; show next when current closes.
   - On claim (no bonus): close current modal only; no server call.
   - On claim x2: call `claim_level_bonus_v4` within TTL; rebase coins/tickets on success; refresh ladder.
4) Telemetry & drift detection
   - Log predicted level vs ack level; log queue depth; tag by `configVersion`.
5) Docs & CHANGELOG
   - Update `docs/app-overview.md` with the decisioning model; append lines to `CHANGELOG.md` after rollout.

## Documentation Impact
- Add `docs/app-overview.md` section: Ladder-driven decisions and FIFO modal queue.
- API contract doc for `/api/v1/config/snapshot`.

## Risks & Mitigations
- Math drift: unit tests for parity; snapshot hash; quick resync.
- Modal spam on overshoot: UX debounce (presentation), logic still FIFO.
- Config churn: `configVersion` gate; reload after current modal.
