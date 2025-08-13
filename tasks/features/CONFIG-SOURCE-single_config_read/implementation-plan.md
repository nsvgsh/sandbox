# CONFIG-SOURCE — Implementation Plan

## Architectural analysis
- `/v1/config` already exposes config rows; the UI should derive `ad_ttl_seconds` and `batch_min_interval_ms` from it and drop usage of dev-only endpoints for these values.

## Task list
1. On app boot, fetch `/v1/config` and cache `ad_ttl_seconds` and `thresholds.batch_min_interval_ms` in state.
2. Replace all TTL/backoff reads in the UI to use these values.
3. Remove any TTL derivation from `/admin/debug/state`.
4. Quick sanity check: countdowns and backoffs behave as expected.

## Documentation impact
- Update docs to state the public `/v1/config` is the sole source for timers/limits.

## Rollout
- Client-only change.
