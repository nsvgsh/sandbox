# Feature Request — X2 Flow: ad_ttl_seconds from t1; Base Claim Ungated

## WHAT
Rework the level-up reward flow so that:
- Base “Claim” is always available (no TTL gating).
- X2 “Claim” becomes available only after a successful ad view and remains available for `ad_ttl_seconds` counted from the moment of ad success (t1).
- Keep the parameter name `ad_ttl_seconds` (single source of truth for the X2 window).

## WHY
- Remove UX confusion from multiple timers and align client/server clocks.
- Make the countdown deterministic (one timer starting at ad success) and easy to reason about.
- Preserve economy control with a single, configurable TTL.

## Acceptance Criteria
- Server validates X2 strictly against `now < ad_event.created_at + ad_ttl_seconds`.
- Base “Claim” requires no TTL checks.
- Frontend countdown starts at ad success and uses `ad_ttl_seconds` from public config only.
- No auto-retry on business 409s (TTL_EXPIRED / ALREADY_CLAIMED).
- Legacy TTLs (claim_ttl_seconds, ad/log TTL return) are unused.
