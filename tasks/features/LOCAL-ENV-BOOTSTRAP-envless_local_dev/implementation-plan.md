# Implementation Plan — LOCAL-ENV-BOOTSTRAP (envless local dev)

## Architectural Analysis
- Next.js auto-loads `.env.local` and `.env.development.local` in dev; this removes the need for shell exports.
- Server code already reads `process.env.DATABASE_URL` and `process.env.DEV_TOKEN`; client/server code reads `NEXT_PUBLIC_*`.
- We keep strict separation: only `NEXT_PUBLIC_*` may be read by client bundle. Server-only secrets remain unprefixed.
- Provide an example file and a setup script to copy it into place and keep `DEV_TOKEN` = `NEXT_PUBLIC_DEV_TOKEN`.
- Validate on `npm run dev` so misconfig is caught early with actionable errors.

## Task List
1) Add example env for web
- Create `web/.env.local.example` with safe local defaults:
  - `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres`
  - `DEV_TOKEN=changeme`
  - `NEXT_PUBLIC_DEV_TOKEN=changeme`
  - `NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS=1`
  - Provide placeholders for Supabase client keys if/when used.

2) Setup and validation scripts in `web/package.json`
- `setup:env`: copy example to `.env.local` if missing; ensure `NEXT_PUBLIC_DEV_TOKEN` matches `DEV_TOKEN`.
- `validate:env`: checks for required vars, matches tokens, validates `DATABASE_URL` format.
- Prepend `validate:env` to the `dev` script for local runs.

3) Dev-only startup checks
- If `DATABASE_URL` is unset when running `next dev`, throw a clear error suggesting `npm run setup:env`.
- Throw if tokens mismatch to avoid confusing 403s on admin endpoints.

4) Docs updates
- README: local quickstart (`cd web && npm run setup:env && npm run dev`).
- `docs/deploy-pipeline.md`: reference `.env.local` for local, keep Vercel/Supabase secrets for prod.

5) Changelog
- Append a line to root `CHANGELOG.md`: `LOCAL-ENV-BOOTSTRAP-001 | Local dev via web/.env.local; setup & validation scripts`.

## Documentation Impact
- `README.md`: new section “Local Development — No Shell Exports”.
- `docs/deploy-pipeline.md`: clarify local vs prod env handling.

## Deviation Handling
- If we discover additional env keys, update example and validation in-place and re-approve.
