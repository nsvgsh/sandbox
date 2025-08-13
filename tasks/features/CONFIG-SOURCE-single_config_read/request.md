# CONFIG-SOURCE — Single config read (public)

## What
Make the UI read timers/limits (e.g., ad_ttl_seconds, batch_min_interval_ms) only from the public `/v1/config` and remove reliance on debug endpoints for these values.

## Why
- One source of truth prevents mismatched countdowns and inconsistent behavior.

## Scope
- In: replace reads for TTL and batch interval to `/v1/config`; remove debug-derived TTL usage.
- Out: changing the data contract of `/v1/config`.

## Acceptance
- UI countdowns and rate-limit backoffs read only from `/v1/config`.
- No remaining usage of admin/debug for these values.
