# Implementation Plan — X2-POLICY (A-only; remove claim_ttl globally)

## Architectural analysis
- Problem: dual TTLs (ad_ttl_seconds A, claim_ttl_seconds C) cause x2 failures when level-up is old but ad→claim is timely.
- Goal: remove C checks everywhere; x2 and task claims rely only on A. Enforce single-use via `impressionId` idempotency and `ad_events` lifecycle.
- Versioning: introduce `claim_level_bonus_v3` (A-only), keep v2 for rollback, and remove v1 entirely.

## Task list
1) SQL: add `claim_level_bonus_v3` (no C), require fresh ad within A; idempotent by `impressionId`; mark ad as used.
2) SQL: drop/remove any remaining v1 artifacts; ensure no code references v1 signature.
3) DB: adjust `ad_events` to include 'used' (status or boolean), add index on `reward_payload->>'impressionId'`.
4) API: update `/v1/level/bonus/claim` to invoke v3 under feature flag; retain v2 path for rollback.
5) Admin/debug: remove `claim_ttl_seconds` from default set or mark as deprecated; keep `ad_ttl_seconds` visible.
6) Docs: update `docs/api-contracts.md` and `docs/app-overview.md` to A-only; add ad lifecycle note (completed→used); document versioning and rollback plan.
7) Tests: unit SQL (fresh/expired/missing/duplicate ad; multi-level), API integration, and manual scripts.
8) Rollout: feature flag `ENABLE_LEVEL_BONUS_V3`; enable in dev/staging → prod; verify metrics; then deprecate v2 and remove after stability window.
9) Changelog: add entries for each completed sub-task.

## Documentation impact
- api-contracts: x2 relies solely on `ad_ttl_seconds`; `claim_ttl_seconds` deprecated (not used in x2). v3 is authoritative; v2 retained for rollback; v1 removed.
- app-overview: two-button level-up; ad-first then Claim x2; A-only gating; single-use impression.
- deploy-pipeline: feature flag rollout steps; smoke tests for v3; rollback to v2.
