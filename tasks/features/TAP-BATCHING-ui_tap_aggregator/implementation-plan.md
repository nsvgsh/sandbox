# TAP-BATCHING – UI tap aggregator (Implementation Plan)

## Architectural analysis
- Current:
  - Each tap posts immediately to `/api/v1/ingest/taps` with `taps=1`, updates UI counters from server response.
  - Pros: strict server authority, correctness; Cons: flicker, network-bound throughput, high request volume.
- Target:
  - Client keeps `baseCounters` (last confirmed) and `pendingTaps` (local, not yet persisted).
  - Render coins as `baseCounters.coins + pendingTaps * coinMultiplier`; never fake level/tickets.
  - A flusher consolidates `pendingTaps` into periodic/thresholded POSTs. On success: update `baseCounters`, reduce `pendingTaps` by sent amount (floor to 0). On `leveledUp`, trigger UI as today.
  - Server remains authoritative for level-ups, tickets, thresholds, durable counters.

Data points
- Coin multiplier is part of counters; use it to derive optimistic coin display.
- Server may soft-clamp batch size; monotonic UI prevents visible regress.
- Session rotation and 409 handling already exist in `fetchJsonWithRetry` callsites.

## Implementation tasks
1) Add aggregator state and flusher in `web/src/app/page.tsx`:
   - State: `baseCounters`, `pendingTaps`, `displayCounters`, `inFlight`, `lastFlushAt`.
   - Replace `tap()` to only bump `pendingTaps` and refresh `displayCounters`.
   - Flusher: `setInterval` every `batchMinIntervalMs` (from config), and immediate flush if `pendingTaps >= 20` (also from config) and no in-flight req.
   - POST body: `taps: sentCount`, `clientSeq: nextSeq`, session ids.
   - Response: set `baseCounters`, `leveledUp`, `nextThreshold`; decrement `pendingTaps` by `sentCount`.
   - Monotonic render: if derived coins < current rendered coins, keep the higher value until next tick.
2) Header HUD smoothing:
   - Optional: small tween (time-based) for coins to target `displayCounters.coins`.
3) Keep server authority:
   - Level-up modal only from server `leveledUp`.
   - Tickets/level from server only. Do not derive locally.
4) Resilience:
   - 429: delay `batchMinIntervalMs` and retry without losing coalesced taps.
   - 409: run `resumeOrStartSession` then retry the same batch.
   - On error: keep `pendingTaps` untouched; UI remains smooth; retry on next tick.
5) Config:
   - Use existing `batchMinIntervalMs` in public config; default to 120ms if missing.
6) Telemetry (console):
   - Log `taps_sent`, `coalesce_ratio`, `retry_429`, `retry_409` for verification.

## Documentation impact
- Update `docs/app-overview.md` (UI & gameplay loop): document always-on client-side tap aggregation; coins render optimistically from `baseCounters + pendingTaps * coinMultiplier`; levels/tickets remain server-driven.
- Update `docs/api-contracts.md` (ingest/config):
  - Reiterate clients may batch taps (`taps > 1`).
  - Specify config keys: `thresholds.batch_min_interval_ms`, `ingest.max_taps_per_batch`, `ingest.clamp_soft`, and `tap_agg.flush_threshold`/`tap_agg.tween_ms_min`/`tap_agg.tween_ms_max`.
  - Clarify counters in responses are authoritative; UI coins may be optimistic between flushes and never decrement visually.
- Update `docs/deploy-pipeline.md` (DB init): add SQL to seed/merge the above config keys.
- Update `docs/env.example`: remove `BATCH_FLUSH_MS` (moved to DB), no client env for tap batching.
- Update `docs/db-models.md`: note `game_config` holds tap batching parameters under `thresholds`, `ingest`, and `tap_agg` keys.

## Migrations (DB-backed tap aggregation parameters)
- Goal: store all batching parameters in `game_config` and expose via `/api/v1/config` for the client.
- Keys and defaults (idempotent):
  - `thresholds.batch_min_interval_ms` (int, default 120) — server guard and client cadence.
  - `ingest.max_taps_per_batch` (int, default 50) and `ingest.clamp_soft` (bool, default true) — existing; ensure present.
  - `tap_agg.flush_threshold` (int, default 20) — client immediate flush threshold.
  - `tap_agg.tween_ms_min` (int, default 80) and `tap_agg.tween_ms_max` (int, default 180) — optional UI smoothing parameters.

Suggested SQL (safe to run repeatedly):

```sql
-- Ensure thresholds has batch_min_interval_ms while preserving base/growth
insert into game_config(key, value)
values ('thresholds', jsonb_build_object('base', 10, 'growth', 'linear', 'batch_min_interval_ms', 120))
on conflict (key) do update set
  value = coalesce(game_config.value, '{}'::jsonb)
        || jsonb_build_object('base', coalesce((game_config.value->>'base')::int, 10))
        || jsonb_build_object('growth', coalesce((game_config.value->>'growth')::text, 'linear'))
        || jsonb_build_object('batch_min_interval_ms', coalesce((game_config.value->>'batch_min_interval_ms')::int, 120));

-- Ensure ingest limits exist
insert into game_config(key, value)
values ('ingest', jsonb_build_object('max_taps_per_batch', 50, 'clamp_soft', true))
on conflict (key) do update set
  value = coalesce(game_config.value, '{}'::jsonb)
        || jsonb_build_object('max_taps_per_batch', coalesce((game_config.value->>'max_taps_per_batch')::int, 50))
        || jsonb_build_object('clamp_soft', coalesce((game_config.value->>'clamp_soft')::boolean, true));

-- Client-side aggregator tuning exposed via /config
insert into game_config(key, value)
values ('tap_agg', jsonb_build_object('flush_threshold', 20, 'tween_ms_min', 80, 'tween_ms_max', 180))
on conflict (key) do update set
  value = coalesce(game_config.value, '{}'::jsonb)
        || jsonb_build_object('flush_threshold', coalesce((game_config.value->>'flush_threshold')::int, 20))
        || jsonb_build_object('tween_ms_min', coalesce((game_config.value->>'tween_ms_min')::int, 80))
        || jsonb_build_object('tween_ms_max', coalesce((game_config.value->>'tween_ms_max')::int, 180));
```

Notes:
- `/api/v1/config` already returns all `game_config` rows; the client should read these keys to configure the aggregator.
- Server-side `apply_tap_batch` already uses `thresholds.batch_min_interval_ms` for guard; no code change required.

## Rollout
- Always-on across all environments and deployments.
- No feature flag. Aggregation and coalescing are the default behavior.

## Validation
- Manual: hold-tap/rapid-tap to observe smooth coins; inspect Network tab for coalesced requests and stable 2xx.
- Edge cases: simulate 429/409; ensure no coin regression on UI.
