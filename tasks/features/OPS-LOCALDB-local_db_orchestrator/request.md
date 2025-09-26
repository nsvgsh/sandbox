# OPS-LOCALDB — Local DB Orchestrator (WHAT & WHY)

## What
Add a developer tool under `ops/` that:
- Drops and recreates the local Postgres DB defined in `web/.env.local` (`DATABASE_URL`).
- Starts a local Postgres cluster if needed (no Supabase, no Docker).
- Applies base schema, extensions, and all migrations.
- Generates and applies SQL from `ops/game-admin` and `ops/integrations-admin`.

## Why
- Speed up onboarding and daily resets.
- Ensure the local DB state strictly follows `docs/deploy-pipeline.md` and admin inputs.
- Reduce manual steps and drift between teammates.
