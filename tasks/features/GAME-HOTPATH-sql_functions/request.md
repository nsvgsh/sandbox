# GAME-HOTPATH — Implement SQL functions for hot path (hybrid approach)

## WHAT
Implement core gameplay logic as Postgres functions and switch API routes to call them:
- `session_start`
- `apply_tap_batch`
- (stubs for) `apply_reward_event`, `claim_level_bonus`, `list_tasks`, `claim_task` (follow-up)

## WHY
- Atomicity and integrity on the hot path
- Minimal delta for prod flip with Supabase cloud + RLS
- Keep TypeScript layer thin for orchestration

## Scope
- Add SQL functions and a minimal `game_config` table
- Update API routes to call functions
- Keep response shapes per `docs/api-contracts.md`

## Out of scope
- Full ads/task verification, partner postbacks (later features)
