# App overview

## Components
- Next.js frontend (Mini App UI) on Vercel Edge
- Telegram WebApp bridge + Telegram Bot (entry)
- Supabase: Postgres (RLS), Auth, Edge Functions, Storage
- Sentry (client)

## High‑level flows
- Telegram client → Bot deep link (startapp/startattach) → WebApp launch
- WebApp reads URL GET `tgWebAppStartParam` for initial routing
- Attachment‑menu launches populate `initDataUnsafe.start_param`
- WebApp → Supabase Edge Function: validate `initData`
- Edge Function → WebApp: user/session payload → issue Supabase JWT
- WebApp ↔ Supabase client SDK: RLS‑protected reads
- WebApp → Edge Functions: secure mutations / anti‑cheat paths
- Vercel CDN/Edge → WebApp: static assets and chunks
- Supabase Storage → WebApp: media/assets

## External integrations
- Analytics: minimal (event tables in Supabase)
- Payments: none in v1
- Error tracking: Sentry (light client init)
- CDN: Vercel default

## Deep links (reference)
- Direct Mini App: `t.me/<bot_username>?startapp[=<campaign_id>]&mode=<mode>`
- Attachment menu: `t.me/<bot_username>?startattach[=<start_parameter>]` (and variants)
- Param exposure: prefer `tgWebAppStartParam`; `initDataUnsafe.start_param` only via attachment menu

## Sessions
- Session start rotates epoch and returns `{ sessionId, sessionEpoch, lastAppliedSeq }`.
- Session claim lets the client resume safely: if ids match, echo; else rotate.

## Ads & tasks
- Ads are intent‑coupled: one ad unlocks one action (`level_bonus` or `task:<id>`).
- X2 bonus window: `ad_ttl_seconds` applies from ad success time (t1 = `ad_events.created_at`); base claim is ungated.
- Level‑up bonus (UI): on level-up, modal offers `Claim` (immediate) or `X2 bonus` (watch ad → confirm within `ad_ttl_seconds`).
  - After ad/log with `intent='level_bonus'`, the modal switches to a single `Claim x2 (Xs)` within TTL. The UI displays the total x2 reward for clarity; the backend applies only the incremental portion per policy and idempotently by `impressionId`.
  - On TTL expiry the modal reverts to the two‑button state.
- Tasks (Offers UI): each task card has `Watch ad` → `Claim (Xs)` within TTL. Unlocks are intent‑bound to that specific task.
  - On successful claim, a confirmation modal shows: header “congratulations!” and `reward: task_reward: { ... }` formatted from the task payload.
  - Ad unlock TTLs use an advisory countdown; the server remains source of truth. If TTL expires, the task stays in AVAILABLE and shows `Watch ad` again (no EXPIRED tab in current UI).

## Security
- Always validate `WebApp.initData` (`hash`, `signature`) server‑side before trusting params
- Do not trust `start_param` until validation completes

## UI (local dev) surfaces
- Home (Game): Counters header (Coins/Tickets/Level), avatar/nickname, Tap Area, level‑up modal with x2 flow.
- Offers: Tabs (AVAILABLE/COMPLETED), per‑task intent‑coupled ad unlock and claim, claim‑success modal.
- Wallet: Read‑only balances (Coins/Tickets) and placeholders for TON/USDT assets; demo “Connect wallet” stores only a public address locally; tabs (Withdrawals/Activity/Airdrop) are stubs.

## Schema and migrations
- `docs/db-schema.sql` is a baseline schema document. Authoritative schema includes additive changes in `supabase/migrations/`.
  - Examples: `ad_events.status` extended with `completed/used`, indexes on `(reward_payload->>'impressionId')`, `claim_level_bonus_v3` (A‑only gating, idempotency, marks ads as used), `level_events.template_id` ensured.
