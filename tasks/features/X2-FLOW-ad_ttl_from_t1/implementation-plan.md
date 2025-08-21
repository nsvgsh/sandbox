# Implementation Plan — X2 Flow: ad_ttl_seconds from t1; Base Ungated

## Architectural Analysis
- Remove legacy gating: base claim has no TTL; only X2 is time-bound.
- `ad_ttl_seconds` remains as the single configurable TTL; applied from ad success (t1) using `ad_events.created_at`.
- Idempotency: `impressionId` stays the idempotency key for X2 claim.
- Canonical statuses in `ad_events`: `closed` (ad success), `failed`, `used`.

## Task List
1) DB migration
   - Create/ensure `ad_ttl_seconds` exists; stop using `claim_ttl_seconds` and TTL in ad/log response.
   - Implement `claim_level_bonus_v4(p_user_id, p_level, p_bonus_multiplier, p_idempotency_key, p_impression_id)`:
     - Validate latest level event not already x2-applied.
     - Fetch ad_event by impressionId, `status='closed'`; check `now - created_at < ad_ttl_seconds`.
     - Apply incremental payload; set ad_event `status='used'`; update counters; return snapshot.
   - Keep existing v3 for backward compatibility if needed, but route API to v4.

2) API changes
   - `/api/v1/level/bonus/claim`: call v4; map errors (TTL_EXPIRED, ALREADY_CLAIMED, NOT_FOUND); do not reference level-based TTL.
   - `/api/v1/ad/log`: keep logging success/failure and payload; do not return TTL.

3) Frontend changes (page.tsx)
   - Base flow: “Claim” just closes modal and refreshes counters; remove any base TTL.
   - X2 flow: on ad success, set `t1` and `impressionId`; show confirm with a countdown starting from `ad_ttl_seconds`; on “Claim x2”, call claim endpoint with `x-idempotency-key`.
   - Disable automatic 409 retry for this endpoint.

4) Docs & cleanup
   - Update `docs/api-contracts.md`: X2 claim contract, errors, idempotency.
   - Update `docs/db-models.md`: statuses, ad_event lookup by impressionId.
   - Update `docs/app-overview.md`: new timing model; remove legacy references.
   - CHANGELOG entry.

## Validation
- Unit: TTL window from `ad_events.created_at` passes/fails correctly; idempotency protects double-claim.
- Integration: happy path, TTL_EXPIRED after timer, repeated ad success resets `t1` and latest impression wins.
- Manual: desktop and Telegram WebView via tunnel.
