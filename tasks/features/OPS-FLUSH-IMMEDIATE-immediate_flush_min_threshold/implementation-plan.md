# OPS-FLUSH-IMMEDIATE — Implementation Plan

## Architectural Analysis
- Inputs: /api/v1/config already returns `tap_agg` and `thresholds`; `ingest` is also in game_config and can be fetched alongside.
- Client already runs a timer tick and has pendingTaps with inflight guards.
- Change is local to the client: compute `effectiveFlush` and trigger immediate flush on reaching the threshold, still respecting `batch_min_interval_ms`.

## Task List
1) Extend parsePublicConfig to surface `ingest.max_taps_per_batch` as `ingestMaxBatch`. [pending]
2) In page.tsx, store `effectiveFlush` in a ref and recompute after config load. [pending]
3) In tap() increment, if `pendingNext >= effectiveFlush` and no inflight and time since last flush >= batch_min_interval_ms, invoke the same flush code used by the timer. [pending]
4) Keep timer flush unchanged for time-based fallback. [pending]
5) Update docs (short note) and CHANGELOG. [pending]

## Documentation Impact
- Add note in runtime-config-admin README that client uses `min(flush_threshold, max_taps_per_batch)` and triggers immediate flush on threshold.
- CHANGELOG entry.
