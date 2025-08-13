# Feature Request — LOCAL-ENV-BOOTSTRAP (envless local dev)

## What
Eliminate the need to export environment variables in the shell for local development of `web/`. Standardize on a single `web/.env.local` file, auto-provisioned from an example, and validated before running the dev server.

## Why
- Reduce onboarding friction and hidden CI/dev mismatches.
- Prevent token drift between client/server (`DEV_TOKEN` vs `NEXT_PUBLIC_DEV_TOKEN`).
- Keep production behavior unchanged while improving local DX.

## Scope
- Add `web/.env.local.example` as canonical local template.
- Add scripts: `setup:env` (provision/sync) and `validate:env` (preflight checks).
- Wire `npm run dev` to validate before starting.
- Update docs (`README.md`, `docs/deploy-pipeline.md`).

## Out of scope
- Moving secrets to DB or runtime-config JSON.
- Any production runtime changes.


