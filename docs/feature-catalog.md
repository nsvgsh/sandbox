# Feature Catalog — v1 baseline (documentation-driven)

This catalog enumerates the current feature tickets and maps them to documentation sources, API endpoints, and DB touchpoints. Documentation is the source of truth. Scope limited to v1.

## Index

| Key | Feature | Status | Intent | Primary sources | Endpoints (API) | DB touchpoints |
|---|---|---|---|---|---|---|
| LOCAL-BOOTSTRAP | Local dev environment | Done | Stand up local stack with basic API and schema | `tasks/features/LOCAL-BOOTSTRAP-local_dev_env/*`, `docs/db-schema.sql`, `docs/api-contracts.md` | `GET /api/v1/health`, `POST /api/v1/auth/dev`, `POST /api/v1/session/start`, `POST /api/v1/ingest/taps` | `user_profiles`, `user_counters`, `tap_batches` |
| GAME-HOTPATH | SQL functions for hot path | Done | Server-authoritative session and tap ingest | `tasks/features/GAME-HOTPATH-sql_functions/*`, `docs/db-migrations/*`, `docs/db-schema.sql` | `POST /api/v1/session/start`, `POST /api/v1/ingest/taps` | `game_config`, `session_start()`, `apply_tap_batch()` |
| INGEST-SOFT | Soft-mode guards | Done | Warn and continue for soft validation | `tasks/features/INGEST-SOFT-guards/*`, `docs/api-contracts.md` | `POST /api/v1/ingest/taps` | `game_config.ingest` (e.g., `max_taps_per_batch`, `clamp_soft`) |
| REWARD-POLICY | Bonus/reward policy | Done | Codify level-up base and bonus claim behavior | `tasks/features/REWARD-POLICY-implement_bonus_reward_policy/*`, `docs/game-design.md`, `docs/api-contracts.md` | `POST /api/v1/level/bonus/claim` | `user_counters.non_progress_coins`, `reward_events`, `claim_level_bonus()` |
| LVL-TEMPLATES | Per-level reward templates | Done | Data-driven rewards snapshotted at level-up | `tasks/features/LVL-TEMPLATES-per_level_reward_templates/*`, `docs/db-schema.sql` | via ingest, debug surfaces | `level_reward_templates`, `level_events.template_id` |
| GD-ALIGN-HIPRI | Align with game-design v1 | Done | Unify thresholds, counters, rewards, endpoints | `tasks/features/GD-ALIGN-HIPRI-align_game_design_v1/*`, `docs/game-design.md`, `docs/api-contracts.md` | `POST /api/v1/ingest/taps`, `GET /api/v1/counters`, `POST /api/v1/level/bonus/claim`, `POST /api/v1/ad/log`, `GET /api/v1/tasks`, `POST /api/v1/tasks/{id}/claim`, `GET /api/v1/leaderboard`, `GET /api/v1/admin/debug/state` | `game_config`, `level_events`, `ad_events`, `task_definitions`, `task_progress`, `leaderboard_global` |
| AD-STUB | Auto-apply level bonus on ad_completed (local) | Done | Stub ad flow that applies incremental bonus | `tasks/features/AD-STUB-auto_apply_level_bonus/*`, `docs/api-contracts.md` | `POST /api/v1/ad/log` | `ad_events` (status expanded), `claim_level_bonus()` |
| TASKS-AD-VIEW | Enforce ad before claim | Done | Require recent ad for task claim, idempotent | `tasks/features/TASKS-AD-VIEW-claim_enforcement/*`, `docs/api-contracts.md` | `GET /api/v1/tasks`, `POST /api/v1/tasks/{id}/claim` | `task_definitions`, `task_progress`, `ad_events`, `apply_reward_event()` |
| LEADERBOARD-META | Rank + active players | Done | Enhance leaderboard response | `tasks/features/LEADERBOARD-meta/*`, `docs/api-contracts.md` | `GET /api/v1/leaderboard?top=K` | `leaderboard_global` |
| ADMIN-TOOLS | Local admin endpoints | Done | DEV_TOKEN-guarded config and debug | `tasks/features/ADMIN-TOOLS-local_admin_endpoints/*`, `docs/api-contracts.md` | `POST /api/v1/admin/config/thresholds`, `GET /api/v1/admin/debug/state` | `game_config.thresholds`, read models |


## Feature details

### LOCAL-BOOTSTRAP
- Intent: Local Next.js + Supabase CLI stack with minimal API.
- Acceptance highlights: health, dev auth, session start, tap ingest; env wiring; schema applied.
- Sources: `tasks/features/LOCAL-BOOTSTRAP-local_dev_env/*`, `docs/db-schema.sql`, `docs/api-contracts.md`.

### GAME-HOTPATH
- Intent: Move core gameplay logic into SQL (`session_start`, `apply_tap_batch`).
- Acceptance highlights: transactional updates, locks/guards, API routes call SQL, structured errors.
- Sources: `tasks/features/GAME-HOTPATH-sql_functions/*`, `docs/db-migrations/*`.

### INGEST-SOFT
- Intent: Soft validations for ingest.
- Acceptance highlights: warn on over-limit taps; checksum warnings; no hard reject in soft mode.
- Sources: `tasks/features/INGEST-SOFT-guards/*`.

### REWARD-POLICY
- Intent: Clear bonus policy; idempotent claims.
- Acceptance highlights: base tickets on level-up; claim multiplier per-field; bank coins separately; idempotency key.
- Sources: `tasks/features/REWARD-POLICY-implement_bonus_reward_policy/*`, `docs/game-design.md`.

### LVL-TEMPLATES
- Intent: Per-level reward templates with snapshot at level-up.
- Acceptance highlights: default fallback; base granted immediately; bonus incremental.
- Sources: `tasks/features/LVL-TEMPLATES-per_level_reward_templates/*`.

### GD-ALIGN-HIPRI
- Intent: Align implementation with design v1 across endpoints and policies.
- Acceptance highlights: server-authoritative coins, unified next-threshold, tasks gating, leaderboard meta, debug surfaces.
- Sources: `tasks/features/GD-ALIGN-HIPRI-align_game_design_v1/*`, `docs/game-design.md`.

### AD-STUB
- Intent: Local stub to auto-apply level bonus after ad completion.
- Acceptance highlights: insert ad event; apply latest eligible level-up bonus; idempotent by `impressionId`.
- Sources: `tasks/features/AD-STUB-auto_apply_level_bonus/*`.

### TASKS-AD-VIEW
- Intent: Require recent ad for task claims.
- Acceptance highlights: `AD_REQUIRED` when missing; idempotent claim; seed example tasks.
- Sources: `tasks/features/TASKS-AD-VIEW-claim_enforcement/*`.

### LEADERBOARD-META
- Intent: Provide user rank and active players meta.
- Acceptance highlights: rank computation; activity window via config/env.
- Sources: `tasks/features/LEADERBOARD-meta/*`.

### ADMIN-TOOLS
- Intent: Local admin endpoints for thresholds and debug state.
- Acceptance highlights: DEV_TOKEN guarded; read/merge/write `game_config.thresholds`; debug dump.
- Sources: `tasks/features/ADMIN-TOOLS-local_admin_endpoints/*`.



## Entities referenced (from `docs/db-schema.sql` and tasks)
- `user_profiles`, `user_counters`, `tap_batches`, `level_events`, `ad_events`, `task_definitions`, `task_progress`, `reward_events`, `leaderboard_global`, `attribution_leads`, `active_effects`, `partner_postbacks`, `game_config`.

## Notes
- Endpoints and contract details are defined in `docs/api-contracts.md`.
- Detailed request/response, errors, idempotency, and auth are to be tracked in the Contracts Matrix.
