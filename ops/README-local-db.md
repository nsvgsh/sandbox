# Local DB Orchestrator

This tool resets and seeds a local Postgres DB using values from `web/.env.local`, following `docs/deploy-pipeline.md`, and applying configs from `ops/game-admin` and `ops/integrations-admin`.

## Requirements
- Postgres client tools in PATH: `psql` (and optionally `pg_ctl`, `initdb`, `pg_isready` for self-hosted local cluster)
- `web/.env.local` with at least:
  - `DATABASE_URL` (e.g. `postgres://postgres:@localhost:5432/tap_app`)
  - `DEV_TOKEN` and `NEXT_PUBLIC_DEV_TOKEN` (optional; recommended to be equal for local auth)

## Usage
```bash
# from repo root
./ops/local-db.sh
# or
node ops/local-db.mjs
```

## What it does
1. Reads `web/.env.local` → `DATABASE_URL`, `DEV_TOKEN`, `NEXT_PUBLIC_DEV_TOKEN`.
2. If host is localhost, ensures a local cluster:
   - Initializes cluster in `ops/.pgdata` if missing (requires `initdb`)
   - Starts it on the port from `DATABASE_URL` (requires `pg_ctl`)
3. Drops and recreates the target database.
4. Applies schema and migrations:
   - `docs/db-schema.sql`
   - `create extension if not exists "pgcrypto";`
   - all files in `supabase/migrations/` in lexical order
5. Generates and applies admin SQL:
   - `node web/scripts/build-game-sql.mjs --in ops/game-admin/input.json --out ops/game-admin/output.sql` then applies
   - `node web/scripts/build-integrations-sql.mjs --in ops/integrations-admin/input.json --out ops/integrations-admin/output.sql` then applies

## Notes
- If `pg_ctl`/`initdb` are not available, the script assumes Postgres is managed externally and only connects via `psql`.
- If the connection user is not `postgres` and Postgres is local, the script best‑effort creates the role.
- All SQL applications run with `ON_ERROR_STOP=1` to fail fast.
