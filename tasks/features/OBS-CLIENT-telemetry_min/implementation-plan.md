# OBS-CLIENT — Implementation Plan

## Architectural analysis
- Use small `console.log(JSON.stringify(...))` events at key branches; redact IDs to 8 chars; no user PII.

## Task list
1. Add logs in taps path: 429 wait+retry (TooFastRetry), 409 refresh (OutOfDateRefresh), network retry (NetRetry).
2. Bonus claim: TTLExpired, AlreadyClaimed, OutOfDateRefresh.
3. Task claim: AdRequired, TaskClaimIdemKeyUsed (when sending x-idempotency-key), OutOfDateRefresh.
4. Verify logs appear in local dev; grep by `event` keys.

## Documentation impact
- Note event keys in docs for local QA reference.

## Rollout
- Client-only; disabled in production by default later if needed.
