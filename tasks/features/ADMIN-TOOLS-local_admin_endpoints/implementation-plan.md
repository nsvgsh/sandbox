# Implementation Plan — ADMIN-TOOLS

## Steps
1) Implement thresholds endpoint (guarded by DEV_TOKEN) — read, merge, write `game_config.thresholds`
2) Implement debug endpoint — return counters, last level_event, leaderboard, config for a given `x-user-id`
3) Update API docs; add to build list

## Documentation Impact
- Update `docs/api-contracts.md` with both endpoints and headers
