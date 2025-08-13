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

## Ads & tasks (local simulation)
- Ad view simulation is intent‑coupled: one ad unlocks one action (`level_bonus` or `task:<id>`) within a short window.
- Level bonus: on level‑up the UI shows two actions: `Claim` (acknowledge base, already granted) and `X2 bonus` (watch ad). After ad, a single `Claim x2` appears and must be pressed within `ad_ttl_seconds` to apply the incremental x2. If the timer expires, the UI returns to two actions.
- Tasks: require a recent ad for that specific task within `ad_ttl_seconds`; others remain locked.

## Security
- Always validate `WebApp.initData` (`hash`, `signature`) server‑side before trusting params
- Do not trust `start_param` until validation completes
