# OPS-LOCALDB — Implementation Plan

## Architectural Analysis
- Reuse existing Node generators in `web/scripts/` to avoid duplication.
- Use `psql` for schema/migrations/apply to match production posture.
- For localhost only, bootstrap a simple cluster in `ops/.pgdata` with `initdb`/`pg_ctl`. If not available, assume Postgres is managed externally.
- Parse `web/.env.local` (no extra deps) to extract `DATABASE_URL`, `DEV_TOKEN`, `NEXT_PUBLIC_DEV_TOKEN`.

## Task List
1. Create `ops/local-db.mjs` orchestrator (parse env, start local PG, drop/recreate DB, apply schema+migrations, run generators, apply outputs).
2. Add `ops/local-db.sh` wrapper for convenience.
3. Add `ops/README-local-db.md` with requirements and usage.
4. Log a CHANGELOG entry.

## Documentation Impact
- `docs/deploy-pipeline.md`: no changes; the tool follows it.
- New `ops/README-local-db.md` documents usage and behavior.
- No API changes.
