# ADMIN-TOOLS — Local admin endpoints for config and debug

## WHAT
Add DEV_TOKEN-guarded endpoints:
- `POST /api/v1/admin/config/thresholds` — tweak thresholds/base and rate limit
- `GET /api/v1/admin/debug/state` — dump server-side counters, last level_event, leaderboard row, config

## WHY
- Accelerate local testing and troubleshooting without SQL access
- Provide a stable introspection surface for agents and humans
