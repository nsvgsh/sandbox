# Request: Baseline Documentation Set (DOCS-BASELINE)

## What
Create the minimum documentation set so any future coding agent instantly understands the project. Targets are exactly those listed in `tasks/prepare-docs.md`:

- README.md – executive summary
- docs/app-overview.md – high-level system diagram and data flow
- docs/game-design.md – core loop, progression, currencies, v1 scope only
- docs/telegram-integration.md – deep-links, JS bridge usage, initData validation
- docs/db-schema.sql + docs/db-models.md – declarative schema and one-line-per-table model notes
- docs/api-contracts.md – edge function routes and request/response contracts
- docs/env.example – runtime variables and secrecy flags
- docs/deploy-pipeline.md – Vercel project/branch, envs, checks
- CHANGELOG.md – log completed sub-tasks per DDP

## Why
- Establish a single-screen understanding (README) and one-page-per-topic docs to minimize onboarding friction.
- Lock-in v1 scope (no payments, no complex ads) and reduce ambiguity for engineering tasks.
- Provide concrete contracts and schema to enable parallel implementation (frontend, edge functions, DB).

## Inputs (from stakeholder interview)
- Problem: Users in Telegram lack hyper-casual games with simple, well-executed reward mechanics.
- Solution: Fast Telegram mini-app clicker with quality visuals.
- Stack: Next.js + React + Lottie; Vercel hosting; Supabase; Telegram WebApp bridge.
- URL: TBA (working titles: “TapStarrr” or “TapTapGift”).
- System: Next.js frontend, Supabase backend, Telegram Bot/WebApp bridge, Vercel hosting.
- Data flow: Telegram → Bot → WebApp → Next.js UI; Next.js ↔ Supabase; Vercel → Next.js build artifacts.
- External services: No payments v1; analytics via Supabase queries; no error tracking/feature flags; CDN via Vercel.
- Game loop: Tap to earn Coins → auto level-ups → optional rewarded ad for 2× recent gain → daily tasks boost.
- Progression: Level n requires 1000×n Coins; level-up converts coins; every 5 levels unlock a task bundle; leaderboard by total levels.
- Currencies: Coins (per tap with multiplier), Levels (metric), Tickets (+1 per level, +5 bundles, +20 rewarded ad) – no sinks in v1.
- v1 cut-offs: No PvP, guilds, premium currency, offline income, gacha, cross-account cloud save, push, complex ads.
- Deep links: `t.me/<bot>/<short_name>?startapp=<campaign_id>&mode=<compact|fullscreen>`; first load posts lead to Edge function.
- Telegram APIs: ready/expand/close, BackButton, viewportChanged, HapticFeedback; no MainButton/CloudStorage/payments in v1.
- Auth: `POST /auth/tg` (Supabase Edge, TS) using `@telegram-apps/init-data-node`, TTL 3600s; on success issue Supabase JWT.
- Payments: not in v1.
- Schema: players, tap_events, level_events, ad_events, task_bundles, task_progress, leaderboard_snap; RLS as described.
- API contracts: `/auth/tg`, `/me`, `/tap`, `/ad/reward`, `/tasks/claim`, `/tasks/active`, `/leaderboard/top`, `/leaderboard/me`.
- Env: Telegram/Supabase keys and flags; treat anon key as credential.
- Deploy: Vercel project `tap-web-app`, branch `main`; envs listed; manual checks for now.


