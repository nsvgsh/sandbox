# Implementation Plan — LEADERBOARD-META

## Architectural Analysis
- Use existing table `leaderboard_global` and its index.

## Task List
- Compute rank as 1 + count(level > myLevel); return activePlayers where updated_at within windowDays (env).
- Add cookies-based user resolution for `me` in the endpoint.

## Documentation Impact
- Update `docs/api-contracts.md` to reflect the response shape and query params.
