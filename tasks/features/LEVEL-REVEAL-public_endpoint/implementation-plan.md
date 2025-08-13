# LEVEL-REVEAL — Implementation Plan

## Architectural analysis
- The data exists in `level_events` with `reward_payload` for the last level. We can query the latest row for the current user and return `{ level, rewardPayload }`.

## Task list
1. Add `web/src/app/api/v1/level/last/route.ts` with `GET`:
   - Read `dev_session` user id
   - Query: `select level, reward_payload as "rewardPayload" from level_events where user_id=$1 order by created_at desc limit 1`
   - Return `{ level, rewardPayload }`
2. Client: when `leveledUp` is set, fetch this endpoint and show payload in the modal (fallback to previous dev-only data if unavailable).
3. Lint and smoke test: trigger a level-up and confirm the modal shows the reward without admin calls.

## Documentation impact
- Update `docs/api-contracts.md` to list the endpoint and its shape.

## Rollout
- Simple read-only endpoint; no schema changes.
