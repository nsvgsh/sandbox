# Implementation Plan: Baseline Documentation Set (DOCS-BASELINE)

## Architectural Analysis (concise)
- Frontend: Next.js + React running inside Telegram WebView; use Telegram JS bridge for UI chrome, haptics, viewport.
- Backend: Supabase (Postgres + Edge Functions). Edge performs Telegram `initData` validation and issues Supabase JWT.
- Hosting/CDN: Vercel for Next.js build and static assets; colocate with Supabase region to keep RTT < 50 ms.
- Observability/payments: deferred for v1; analytics via SQL over Supabase.
- Data model: Minimal event-sourcing for taps/levels/ads; materialised views for leaderboards; RLS enforces per-user isolation.
- Risks to note (non-blocking): Telegram WebView quirks (iOS vs Android), `initData` TTL, content security policy, viewport changes.

## Task List
1. DOCS-BASELINE-01 Create `README.md` with one-screen executive summary and quick links.
2. DOCS-BASELINE-02 Add `docs/app-overview.md` with components and data-flow diagram.
3. DOCS-BASELINE-03 Add `docs/game-design.md` with core loop, progression, currencies, v1 scope; link wireframes.
4. DOCS-BASELINE-04 Add `docs/telegram-integration.md` (deep-links, APIs used, `initData` validation flow, payments note).
5. DOCS-BASELINE-05 Add `docs/db-schema.sql` with tables, constraints, basic RLS policies.
6. DOCS-BASELINE-06 Add `docs/db-models.md` (one paragraph per table + relationships).
7. DOCS-BASELINE-07 Add `docs/api-contracts.md` (routes, auth, req/resp JSON).
8. DOCS-BASELINE-08 Add `docs/env.example` (vars + secrecy flags).
9. DOCS-BASELINE-09 Add `docs/deploy-pipeline.md` (Vercel project/branch/envs/checks).
10. DOCS-BASELINE-10 Create/append `CHANGELOG.md` entries for each sub-task.

## Documentation Impact
- Establishes the authoritative v1 scope and contracts; future features will extend these docs via the same protocol.
- No schema migration applied yet; `db-schema.sql` serves as the declarative source for later migrations.


