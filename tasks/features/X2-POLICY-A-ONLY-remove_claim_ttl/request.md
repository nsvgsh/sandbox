# X2-POLICY — A-only timing for level bonus (remove claim_ttl globally)

## What
Adopt a single timing rule for time‑gated rewards: only the ad‑view → claim gap (`ad_ttl_seconds`) governs eligibility. Remove the legacy level‑up → claim TTL (`claim_ttl_seconds`) from all flows, starting with the level bonus (x2).

## Why
- Valid x2 claims fail today if the level‑up is “old,” even when ad→claim is within the allowed window.
- Aligns bonus with task semantics (intent‑coupled, short ad window). Simpler mental model; fewer hidden regressions.

## Scope
- SQL: add `claim_level_bonus_v3` with no `claim_ttl_seconds` checks; require fresh ad within `ad_ttl_seconds` and idempotency by `impressionId`.
- API: `/v1/level/bonus/claim` calls v3; `/v1/ad/log` continues to only record ads and return `impressionId`.
- DB: normalize `ad_events` lifecycle for single‑use (completed → used) and index by `impressionId`.
- Admin/debug: stop surfacing `claim_ttl_seconds` for bonus (or mark deprecated); keep `ad_ttl_seconds` visible.
- Docs: update contracts/overview to A‑only for bonus.
- Versioning policy: keep v2 available for rollback during rollout; remove v1 entirely (no remaining references).

## Acceptance
- Level‑up → X2 bonus → Claim x2 within A → success, regardless of level‑up age.
- Level‑up → X2 bonus → wait >A → Claim x2 → TTL_EXPIRED; re‑watch ad → Claim x2 → success.
- Idempotency: the same `impressionId` cannot grant x2 twice; old ads do not apply.
- Versioning: v2 callable behind a flag for rollback; v1 removed from the database and code paths.
