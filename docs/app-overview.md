# App overview

## Components
- Next.js frontend (Mini App UI) on Vercel Edge
- Telegram WebApp bridge + Telegram Bot (entry)
- Supabase: Postgres (RLS), Auth, Edge Functions, Storage
- Sentry (client)

## High‑level flows
- Telegram client → Bot deep link (startapp/startattach) → WebApp launch
- WebApp reads URL GET `tgWebAppStartParam` for initial routing and attribution (maps to `startapp`)
- Attachment‑menu launches populate `initDataUnsafe.start_param`
- WebApp → `/api/v1/auth/tg`: validate `initData`, set app cookie bound to user_id
- WebApp → `/api/v1/session/claim|start`: resume or start gameplay session (propagate `x-startapp`)
- WebApp ↔ Supabase (via server) for gameplay mutations and reads
- Vercel CDN/Edge → WebApp: static assets and chunks
- Supabase Storage → WebApp: media/assets

## External integrations
- Analytics: minimal (event tables in Supabase)
- Payments: none in v1
- Error tracking: Sentry (light client init)
- CDN: Vercel default
 - PropellerAds S2S:
   - First session start/claim with attribution → `goal=visit`
   - Monetag milestones → `goal=2` (first), `goal=3` (third)
   - Optional payouts from `game_config` (`propeller_payout_goal2`, `propeller_payout_goal3`)

## Deep links (reference)
- Direct Mini App: `t.me/<bot_username>?startapp[=<campaign_id>]&mode=<mode>`
- Attachment menu: `t.me/<bot_username>?startattach[=<start_parameter>]` (and variants)
- Param exposure: prefer `tgWebAppStartParam`; `initDataUnsafe.start_param` only via attachment menu

## Sessions
- Session start rotates epoch and returns `{ sessionId, sessionEpoch, lastAppliedSeq }`.
- Session claim lets the client resume safely: if ids match, echo; else rotate.
- On first launch after auth, the client forwards `startapp` to `POST /v1/session/start` via `x-startapp` header (fallback: URL `?startapp=` or `?tgWebAppStartParam=`). On resume, the client also forwards `x-startapp` to `POST /v1/session/claim`. The server parses and persists attribution in `attribution_leads` and immediately attempts a PropellerAds S2S postback if enabled.

## Ads & tasks
- Ads are intent‑coupled: one ad unlocks one action (`level_bonus` or `task:<id>`).
- X2 bonus window: `ad_ttl_seconds` applies from ad success time (t1 = `ad_events.created_at`); base claim is ungated.
- Level‑up bonus (UI): on level-up, modal offers `Claim` (immediate) or `X2 bonus` (watch ad → confirm within `ad_ttl_seconds`).
  - After ad/log with `intent='level_bonus'`, the modal switches to a single `Claim x2 (Xs)` within TTL. The UI displays the total x2 reward for clarity; the backend applies only the incremental portion per policy and idempotently by `impressionId`.
  - On TTL expiry the modal reverts to the two‑button state.
- Level‑up Free Trial (UI): when a level is scheduled in `level_offer_schedule` with `partner_key='free_trial'` and `skip_base_reward=true`, a dedicated modal is shown instead of the bonus modal.
  - The modal has a header and an expanded reward area with an image asset and a single CTA that opens a partner link in a new tab via a non‑claimable, level‑based redirect (`/api/v1/offer/free-trial/level/{level}/modal-redirect`, `provider='free_trial'`, `placement='level_up_modal'`, unique `impressionId`).
  - The Earn tile for the Free Trial appears independently; claiming the reward is done only from the Earn tile.
- Tasks (Offers UI): each task card has `Watch ad` → `Claim (Xs)` within TTL. Unlocks are intent‑bound to that specific task.
  - On successful claim, a confirmation modal shows: header “congratulations!” and `reward: task_reward: { ... }` formatted from the task payload.
  - Ad unlock TTLs use an advisory countdown; the server remains source of truth. If TTL expires, the task stays in AVAILABLE and shows `Watch ad` again (no EXPIRED tab in current UI).
- Free Trial partner tasks: the tile CTA opens a partner link in a new tab via a claimable redirect (records `ad_events` with `provider='free_trial'`, `placement='earn_tile'`, `intent='task:<id>'`); on return, a lightweight readiness check may flip the CTA to `Claim`. No TTL is enforced for Free Trial claims.

## Tap aggregation (always-on)
- Client aggregates taps locally and flushes coalesced counts to `/v1/ingest/taps` on a timer and when a size threshold is reached.
- UI coins are derived as `lastServerCoins + floor(pendingTaps × coin_multiplier × coins_per_tap)` for smoothness. Levels and tickets update only from server responses.
- Server remains authoritative for progression; any server clamp or rounding will reconcile without visual regress (monotonic render).

## Progression & economy (no-spend level-ups)
- Coins never decrease. Level-ups are triggered when current coins reach the absolute threshold for the next level.
- Thresholds use a polynomial function (no-spend, absolute), coefficients read from `game_config.thresholds_poly`:
- coins_required(L) = floor(156 + 800·L + 195·L^2 + 7.36·L^3).
- Base rewards (coins/tickets/coin_multiplier) for a level are applied after the level-up loop per batch; rewards do not trigger further level-ups within the same batch.
 - coins_per_tap is read from `game_config.coins_per_tap` and also provided to clients via `/v1/config`.
 - coin_multiplier semantics: any payload.coin_multiplier is treated as ABSOLUTE set (overwrites current multiplier).
 - Bonus x2 does not affect coin_multiplier (only coins/tickets are incremented by x2 policy).
 - HUD numbers animation duration is controlled by `hud_tween_ms` (0 disables animation).

## Security
- Always validate `WebApp.initData` (`hash`, `signature`) server‑side before trusting params
- Do not trust `startapp`/`start_param` until validation completes

## UI (local dev) surfaces
- Home (Game): Counters header (Coins/Tickets/Level), avatar/nickname, Tap Area, level‑up modal with x2 flow.
- Offers: Tabs (AVAILABLE/COMPLETED), per‑task intent‑coupled ad unlock and claim, claim‑success modal.
- Wallet: Read‑only balances (Coins/Tickets) and placeholders for TON/USDT assets; demo “Connect wallet” stores only a public address locally; tabs (Withdrawals/Activity/Airdrop) are stubs.

## Schema and migrations
- `docs/db-schema.sql` is a baseline schema document. Authoritative schema includes additive changes in `supabase/migrations/`.
  - Examples: `ad_events.status` extended with `completed/used`, indexes on `(reward_payload->>'impressionId')`, `claim_level_bonus_v3` (A‑only gating, idempotency, marks ads as used), `level_events.template_id` ensured.

## Home Screen

- The main tap area is centered with an animated circular CTA ring that reads "START TAP TO EARN REAL CASH". The ring rotates when idle, fades out immediately on tap, and fades back in after ~1s of inactivity. It is decorative (`aria-hidden`) and respects `prefers-reduced-motion` (disables rotation). Typography follows Lilita One with subtle stroke and drop-shadow, and sizing adapts to the 320–420px container range.
