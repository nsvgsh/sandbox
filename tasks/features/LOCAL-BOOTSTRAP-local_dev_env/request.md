# LOCAL-BOOTSTRAP — Local dev environment (Next.js + Supabase CLI)

## WHAT
Stand up a fully local development stack:
- Next.js app (`web/`) with basic API routes
- Supabase CLI (local Postgres/Auth/REST) with schema applied
- Dev login flow for localhost only

## WHY
- Unblock rapid iteration without external dependencies
- Exercise the documented API contracts and DB schema locally
- Validate session/epoch semantics and ingest pipeline early

## Scope
- Local-only; no remote services
- Minimal endpoints: `health`, `auth/dev`, `session/start`, `ingest/taps` (stub logic)
- Apply `docs/db-schema.sql` to local Postgres
- Env wiring and run scripts

## Out of scope
- Telegram initData validation (covered later)
- Ad provider integration (mock only)
- Full anti-cheat and partner postbacks


