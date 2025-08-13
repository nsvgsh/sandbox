# OBS-CLIENT — Minimal client telemetry (local)

## What
Add lightweight client logs for unlucky paths to measure frequency and confirm calm retry rules:
- TooFastRetry (429), OutOfDateRefresh (409), NetRetry, TTLExpired, AlreadyClaimed, AdRequired, TaskClaimIdemKeyUsed

## Why
- Understand real-world rates of retries/conflicts/expiry and spot regressions early.

## Scope
- In: structured console logs (local dev), short IDs, no sensitive data.
- Out: full analytics stack.

## Acceptance
- Logs are printed for the listed events with small JSON payloads; no secrets; easy to grep.
