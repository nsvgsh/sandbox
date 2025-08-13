# LEVEL-REVEAL — Public reward reveal endpoint (request)

## What
Expose a public read endpoint to fetch the last level-up reward payload for the current user, so the level-up modal can render base rewards without using dev-only endpoints.

- Route: `GET /v1/level/last` → `{ level, rewardPayload }`

## Why
- Remove reliance on admin/debug reads for normal UI flows; make the level-up modal consistent and safe to use in all environments.

## Scope
- In: add the endpoint on the server; wire the client to use it when `leveledUp` triggers.
- Out: changing reward computation or policy.

## Acceptance (high-level)
- When a level-up occurs, the UI fetches `/v1/level/last` and shows `{ coins, tickets, coin_multiplier }` fields if present.
- No dev-token is required; endpoint respects the current user session.
