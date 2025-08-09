# Implementation Plan — LOCAL-BOOTSTRAP

## Architectural Analysis
- Single repo with docs; add `web/` (Next.js) and `supabase/` (CLI state).
- All DB mutations/read models via server API routes using the service role key (never exposed to client).
- Dev login issues httpOnly cookie signed with `DEV_JWT_SECRET` and guarded by `DEV_TOKEN` header (dev-only).
- Apply `docs/db-schema.sql` to local Postgres via Supabase CLI.
- Keep endpoints consistent with `docs/api-contracts.md` but allow stubbed logic initially.

## Task List
1) Supabase CLI setup
- `supabase init --yes`
- `supabase start`
- `supabase status -o env` to capture local REST URL and anon/service keys
- Apply `docs/db-schema.sql` to local DB

2) Next.js app scaffold under `web/`
- `npx create-next-app@latest web --ts --eslint --app --src-dir --use-npm --no-tailwind --import-alias @/* --yes`
- `npm i @supabase/supabase-js zod cookie jose` inside `web/`

3) Environment files
- `web/.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_DEV_MODE=1`
- `web/.env`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEV_TOKEN`, `DEV_JWT_SECRET`

4) API routes (App Router)
- `GET /api/v1/health` → `{ ok: true }`
- `POST /api/v1/auth/dev` → header `DEV_TOKEN` check; set `dev_session` cookie with `{ userId }`
- `POST /api/v1/session/start` → upsert `user_profiles`/`user_counters`; return `{ sessionId, sessionEpoch, lastAppliedSeq }`
- `POST /api/v1/ingest/taps` → validate session headers/cookie; insert `tap_batches`; update counters; return snapshot

5) Minimal client UI
- Home page: Dev Login button (when no cookie), tap button, counters view
- Client batcher stub to call `/api/v1/ingest/taps`

6) Docs & run scripts
- Add README snippet for local run
- Update `CHANGELOG.md`

## Documentation Impact
- Add local-run notes to `docs/deploy-pipeline.md`

## Deviation Handling
- If local Supabase Auth is noisy, keep pure Postgres tables and service-role server access; revisit RLS policies later.
