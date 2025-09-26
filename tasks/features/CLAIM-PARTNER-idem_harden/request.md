## Request: Free Trial Claim Idempotency Hardening

### WHAT
- For Free Trial task claims, ignore client-provided `X-Idempotency-Key` and always use the matched `ad_events.id` (uuid) as the idempotency key.

### WHY
- Prevent invalid idempotency keys from optimistic unlocks; ensure safe uuid usage and consistent spend-once semantics.


