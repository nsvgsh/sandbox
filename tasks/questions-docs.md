 Focused sequence of questions, grouped by each target file, so that when answered the draft of every document with no further clarification needed.

1. /README.md – Executive summary  
   1. What one-sentence problem are we solving?  
        Пользователям в teelgram не хватает гипер-казуальных игр с простыми, понятными, хорошо реализованными механиками вознаграждения.
   2. What is the one-sentence solution statement?
        Быстрая telegram mini app игра в жанре clicker/tap and click game с качественным визуалом.
   3. Tech stack (runtime, frameworks, hosting)?
        Runtime: Telegram Mini App (in‑app WebView with Web Apps JS bridge).
        Framework: Next.js + React.
        Hosting: Vercel. Backend: Supabase (Postgres, Auth, Edge Functions).
        UX/animations: CSS transforms + Framer Motion for micro‑interactions; Rive only for compact, branded sequences.
        Haptics: Telegram.WebApp.HapticFeedback. Audio: WebAudio (tap/reward SFX).
   4. Planned public/live URL (or naming convention)?  
        TBA. But something around “TapStarrr” or “TapTapGift”.

2. /docs/app-overview.md – System diagram context  
   1. Confirm main components: Next.js frontend, Supabase backend, Telegram WebApp bridge, Vercel hosting – anything else?  
        Next.js frontend (Mini App UI) on Vercel Edge
        Telegram WebApp bridge + Telegram Bot (entry point)
        Supabase: Postgres (RLS), Auth, Edge Functions, Storage
        No additional backend beyond Supabase (v1)
   1. High-level data flow between these components (one-line per arrow).
        Telegram client → Bot deep link (startapp/startattach) → WebApp launch
        WebApp (Next.js) reads routing from URL GET `tgWebAppStartParam`
        If launched via attachment‑menu link, `initDataUnsafe.start_param` is also populated
        WebApp → Supabase Edge Function: validate `initData` hash/signature
        Supabase Edge Function → WebApp: user/session payload
        WebApp ↔ Supabase (client SDK): RLS‑protected reads
        WebApp → Supabase Edge Functions: secure mutations/anti‑cheat paths
        Vercel CDN/Edge → WebApp: static assets and chunks
        Supabase Storage → WebApp: media/assets (if used)
   2. External services/integrations not yet mentioned (analytics, payments, CDN, etc.)?
        Payments: none in v1
        Analytics: minimal (Supabase event tables)
        Error tracking: Sentry (lightweight client init)
        Feature flags/experiments: none in v1 (can use a DB table later)
        CDN: Vercel (default)
        Crash reporting (mobile shell): not applicable
        Deep links and start_param handling (from Telegram docs):
            Direct Mini App links (main/specific app):
            t.me/<bot_username>?startapp&mode=<mode>
            t.me/<bot_username>/<short_name>?startapp=<start_parameter>&mode=<mode>
            tg://resolve?domain=<bot_username>&appname=<short_name>&startapp=<start_parameter>&mode=<mode>
            Attachment/side menu links:
            t.me/<bot_username>?startattach[=<start_parameter>] [&choose=users+bots+groups+channels]
            tg://resolve?domain=<bot_username>&startattach[=<start_parameter>]
            Open in a specific chat (attachment menu):
            t.me/<username>?attach=<bot_username>&startattach=<start_parameter>
            t.me/+<phone_number>?attach=<bot_username>&startattach=<start_parameter>
            Param exposure in the Mini App:
            Use URL GET `tgWebAppStartParam` for initial routing (for deep‑link launches)
            `WebApp.initDataUnsafe.start_param` is only present for attachment‑menu via link
            Security:
            Always validate `WebApp.initData` (`hash`, `signature`) server‑side before trusting params

3. /docs/game-design.md – Core loop & scope  
   1. Describe the core player loop in ≤3 sentences.  
        Player opens the mini app → taps to earn Coins → Coins auto‑convert to Levels at thresholds. At each level‑up the player is offered an ad‑gated bonus multiplier (configurable, e.g., ×2) that multiplies the level‑up reward; skipping shows no bonus multiplier. Optional tasks (from the Offers screen) grant bonuses including coin multiplier boosts.
   2. Progression rules: levels or milestones and how they are earned.  
        Level n requires 1 000 × n Coins. Early levels should feel instant. Escalation formula and thresholds must be configurable (constants, not hard‑coded).
        Level‑up instantly converts the required Coins into one Level and resets the Coin counter to 0 (excess Coins carry over).
        Each Level unlocks a new task bundle in the Offers screen (blurred until unlocked). For v1, tasks unlock strictly at level thresholds; this gating should be data‑driven for future variation.
        Leaderboard ranks are determined by total Levels reached (global only in v1). 
   3. In-game currencies: names, acquisition methods, sinks, formulas.  
        Coins.
        Earned: each tap grants 1 × coin_multiplier (starts at 1). Also awarded via tasks and level‑up rewards. Third‑party ad SDKs are used for ad‑gated rewards in v1.
        Spent: auto‑consumed on level‑up; no manual sinks in v1.
        Formula: coins_per_tap = 1 × coin_multiplier (coin_multiplier is a boost value from bonuses; configurable, not hard‑coded).
        Levels.
        Earned: automatically when the Coin threshold is met.
        Spent: not spent; progression metric.
        Tickets (NOT deferred in v1; ARE BEING RECIEVED in v1; do no have using scenarios in v1 gameplay).
        Earned: may be granted by tasks/level‑ups.
        Sink: gifts lottery (post‑v1). Keep schema/UI ready; feature disabled in v1.
   4. v1 features only – list hard cut-offs (what will NOT ship).  
        PvP mechanics (duels, real-time taps)
        Guilds / social clans
        Secondary premium currency (gems) or IAP storefront
        Offline passive income generation
        Skin rarity tiers or gacha boxes
        Cloud save across multiple Telegram accounts
        Push‑notification re‑engagement
        Complex ad formats (interstitials, offerwalls)
        Telegram Stars monetization
        Crypto rewards (TON/USDT) as mechanics (UI/DB prepared, feature disabled in v1)
        Daily goals/streaks
        Anti‑cheat beyond basic tap‑rate sanity checks (see TBD below)
        Haptics/music/reduced‑motion polish (v1 is functional scaffold)
   5. Links to any existing UI mocks or wireframes.  
        References and ASCII wireframes are in `docs/UI-mocks-wireframes`
   6. Multipliers (terminology & behavior)
        • Coin multiplier: persistent/timed boost that multiplies coins_per_tap; can be granted by tasks, level‑ups, or ad rewards. Values are configurable.
        • Level‑up reward payload: a list of base bonuses granted on level‑up (e.g., { coins, tickets, coin_multiplier }).
        • Bonus multiplier: ad‑gated coefficient applied to the level‑up reward payload per bonus‑type policy. Example policy (config‑driven, not hard‑coded): coins → multiplicative, tickets → additive, coin_multiplier → multiplicative or step increment. Always offered at level‑up; skipping yields no multiplier.
   7. Configuration policy (avoid hardcoding)
        • Level threshold formula, bonus multiplier values, coin multiplier tables, unlock gates → stored in config/constants, not hard‑coded.
   8. Open design items (explicit stubs for v1)
        • Task verification (social/partner/in‑app): TBD. Implement a stub interface and data model; actual verification logic to be designed later.
        • Ads taxonomy and caps: define provider, frequency caps, and failure fallbacks in config.
        • Season mechanics: TBD; disabled in v1.

4. /docs/telegram-integration.md  
   1. Required deep-link patterns ( list all `startapp` parameters ).  
         Direct Mini App link (main Mini App only – single app under the bot in v1):
         t.me/<bot_username>?startapp[=<campaign_id>]&mode=<compact|fullscreen>
         Notes:
         • <campaign_id> is an opaque string from traffic sources.
         • All deep links route to the main screen in v1. Read client URL GET `tgWebAppStartParam` for routing/attribution. For attachment‑menu links, `initDataUnsafe.start_param` is populated.
         • We do NOT use /<short_name> links in v1 (reserved for multi‑Mini‑App bots later).
         Attribution:
         • On first load, client posts {campaign_id, tg_user_id} to /track/lead (Supabase Edge) for attribution.
          • If traffic provider is PropellerAds, pass its click ID in the deep link (e.g., `startapp=subid:{SUBID}`) and persist it inside `attribution_leads.meta` as `{ provider:'propellerads', subid, zoneid?, subzone_id?, campaignid? }`. This enables optional S2S postbacks for campaign optimization (see Q5).
   2. Telegram JS API calls you plan to use (buttons, viewport, payments, etc.).  
         Mandatory essentials:
         Telegram.WebApp.ready() – handshake / loading bar off
         Telegram.WebApp.expand(), close() – viewport control
         Telegram.WebApp.BackButton – in-app navigation
         Telegram.WebApp.onEvent('viewportChanged') – safe-area paddings
         Not required in v1 (can be enabled later):
         Telegram.WebApp.HapticFeedback.* – tactile feedback (deferred per v1 scope)
         Telegram.WebApp.MainButton – no single global CTA; local UI buttons suffice.
         Telegram.WebApp.CloudStorage.* – negligible data (<5 KB); authoritative state stays in Supabase.
         openInvoice / Stars APIs – out of scope for v1. 
   3. initData validation: server endpoint that will verify the hash – detail preferred language/library.  
         Library: use telegram-apps sdk
         Endpoint: POST /auth/tg (Supabase Edge Function, TypeScript).
         Library: @telegram-apps/init-data-node – HMAC‑SHA‑256 validation and TTL.
         Flow:
         • Client sends initDataRaw (in Authorization: tma <initDataRaw> or JSON body) on first launch.
         • Server validate(initDataRaw, BOT_TOKEN, { expiresIn: CONFIG_TTL_SECONDS }); on failure → 401.
         • On success, parse user id, upsert DB row, issue Supabase JWT.
         Security:
         • Keep BOT_TOKEN in env. Optionally pass a SHA‑256‑hashed token with { tokenHashed: true }.
         • Never trust `start_param` before validation; prefer URL GET `tgWebAppStartParam` for UI bootstrap.
   4. Payment or Stars flow – will we support it in v1? If yes, outline receipt-validation plan.  
        Telegram Payments / Stars: NOT included in v1 – focus on pure ad-monetised loop.
        Receipt-validation flow therefore deferred. 

5. /docs/db-schema.sql + /docs/db-models.md  
   1. Data entities (tables) with key columns (v1, micro‑batching)
        - user_profiles (user_id PK UUID, created_at, locale text, attribution_campaign_id text null)
        - user_counters (user_id PK UUID, coins bigint, tickets int default 0, coin_multiplier numeric(10,4) default 1.0, level int, total_taps bigint,
                         session_epoch uuid null, current_session_id uuid null, last_applied_seq bigint default 0, updated_at timestamptz)
        - tap_batches (batch_id UUID PK, user_id UUID, session_id UUID, client_seq bigint, taps int, coins_delta bigint, checksum text, status text check(status in ('pending','applied','dup','rejected')), created_at timestamptz, applied_at timestamptz null, error_code text null)
        - level_events (id bigserial PK, user_id UUID, level int, base_reward bigint, reward_payload jsonb, bonus_offered bool, bonus_multiplier numeric(10,4) null, ad_event_id UUID null, created_at timestamptz)
        - ad_events (id UUID PK, user_id UUID, session_id UUID, provider text, placement text,
                     status text check(status in ('filled','closed','failed')),
                     reward_payload jsonb, created_at timestamptz)
        - task_definitions (task_id UUID PK, unlock_level int, kind text check(kind in ('in_app','social','partner')), reward_payload jsonb, verification text check(verification in ('none','server','external')), active bool default true, created_at timestamptz)
        - task_progress (user_id UUID, task_id UUID, state text check(state in ('locked','available','claimed')), claimed_at timestamptz null, PRIMARY KEY(user_id, task_id))
        - attribution_leads (user_id UUID, campaign_id text, first_seen_at timestamptz, meta jsonb, PRIMARY KEY(user_id))
        - reward_events (id UUID PK, user_id UUID, source_type text check(source_type in ('level_up','task_claim','ad_bonus','admin_grant','promo','fixup')), source_ref_id text, base_payload jsonb, multiplier_applied numeric(10,4) null, policy_key text null, effective_payload jsonb, coins_delta bigint default 0, tickets_delta int default 0, coin_multiplier_delta numeric(10,4) default 0, status text check(status in ('applied','rolled_back')) default 'applied', idempotency_key text, created_at timestamptz)
        - leaderboard_global (user_id UUID PK, level int, updated_at timestamptz)  -- materialized view or table refreshed periodically
         - partner_postbacks (id bigserial PK, user_id UUID, provider text check(provider in ('propellerads')), subid text, goal int,
                               url text, status text check(status in ('pending','sent','failed','duplicate')) default 'pending',
                               http_code int null, response_hash text null, attempts int default 0, created_at timestamptz, sent_at timestamptz null,
                               UNIQUE(user_id, provider, goal))
         - active_effects (effect_id UUID PK, user_id UUID, type text check(type in ('coin_multiplier')), magnitude numeric(10,4),
                           expires_at timestamptz, source_reward_event_id UUID, created_at timestamptz,
                           UNIQUE(user_id, type, source_reward_event_id))

        Suggested indexes:
        - tap_batches: unique (user_id, batch_id), index (user_id, created_at), index (user_id, client_seq)
        - level_events: index (user_id, created_at desc)
        - ad_events: index (user_id, created_at desc)
        - task_progress: unique (user_id, task_id)
        - leaderboard_global: index (level desc)

   2. Relationships (FKs or logical references)
        - user_profiles.user_id → auth.users.id (UUID) [FK allowed across schemas]
        - user_counters.user_id → user_profiles.user_id
        - tap_batches.user_id → user_profiles.user_id
        - level_events.user_id → user_profiles.user_id
        - ad_events.user_id → user_profiles.user_id
        - task_progress.user_id → user_profiles.user_id
        - task_progress.task_id → task_definitions.task_id
        - level_events.ad_event_id → ad_events.id (nullable)
        - attribution_leads.user_id → user_profiles.user_id
        - reward_events.user_id → user_profiles.user_id
         - partner_postbacks.user_id → user_profiles.user_id
         - active_effects.user_id → user_profiles.user_id
         - active_effects.source_reward_event_id → reward_events.id

        Notes:
        - We avoid cascading deletes; users are soft‑retained to keep audit trails.
        - If referencing auth.users with FK complicates migrations, store UUID without FK and add a periodic integrity check.

   3. Row‑Level Security (RLS) expectations
        - General: enable RLS on every user‑scoped table. Default deny.
        - Policies:
          • SELECT: `user_id = auth.uid()` on user_counters, tap_batches, level_events, ad_events, task_progress, reward_events, attribution_leads, leaderboard_global (read own row only; public leaderboard will have a separate view without PII).
          • INSERT/UPDATE: only via security‑definer RPCs for mutating tables (`tap_batches`, `user_counters`, `level_events`, `task_progress`, `reward_events`). Direct DML by clients is denied.
          • Admin scope (service role): full access for maintenance (refresh leaderboard, seed tasks).

        Security‑definer RPCs (to be documented in API contracts):
          • session_start() → returns { session_id, session_epoch }; sets both on `user_counters` and resets last_applied_seq=0 (rotates epoch)
          • session_claim(session_id uuid) → rotates `session_epoch` to a new value, sets `current_session_id=session_id`, resets last_applied_seq=0
          • apply_tap_batch(user_id uuid, batch_id uuid, session_id uuid, session_epoch uuid, client_seq bigint, taps int, coins_delta bigint, checksum text) → epoch must match; returns updated counters, next_threshold
          • claim_level_bonus(level int, ad_event_id uuid, bonus_multiplier numeric) → validates `ad_events`, computes effective rewards from `level_events.reward_payload` and policy, inserts `reward_events`, updates `user_counters` atomically (once per level)
          • list_tasks() → returns unlocked tasks with states
          • claim_task(task_id uuid) → sets state to claimed (or pending), then applies reward via `reward_events` if verification=none
          • apply_reward_event(user_id uuid, source_type text, source_ref_id text, base_payload jsonb, multiplier numeric null, policy_key text null) → shared function used by claims/admin grants; upserts `reward_events` (idempotent) and updates `user_counters`
          • get_counters() → returns `user_counters` + lightweight summary
          • enqueue_partner_postback(user_id uuid, provider text, subid text, goal int) → inserts into `partner_postbacks` if not exists; service job will deliver

        Basic anti‑abuse guards in RPCs:
          • Token bucket per user for batch applies (e.g., min interval 200–300 ms; burst 5). Configurable.
          • Max taps per batch, max coins_delta per batch; reject with error_code.
          • Idempotency: dedup by (user_id, batch_id); if duplicate, return previous result.

   4. Data integrity & computed logic
        - Level thresholds: formulas stored in `game_config` (kv table or JSON config) to avoid hardcoding.
        - Bonus application policy: store per‑bonus rules in `game_config` (e.g., key: level_bonus_policy, value JSON mapping type→rule). Server applies rules when claiming the bonus. All grants are applied exclusively by inserting into `reward_events` within the same transaction that updates `user_counters`.
        - Ad provider: Monetag SDK for TMA [docs](https://docs.monetag.com/docs/sdk-reference/). Client uses `show_<ZONE>()` Promise API with types 'preload' → 'end' for placement "level_up_bonus". Claim allowed only when Promise resolves with `reward_event_type='valued'`.
        - `ad_events.reward_payload` schema (Monetag):
          {
            provider: 'monetag',
            placement: 'level_up_bonus',
            zone_id?: number, sub_zone_id?: number,
            request_var?: string, ymid: string, telegram_id?: string,
            reward_event_type: 'valued' | 'not_valued',
            estimated_price?: number,
            sdk_session_id: string, ad_tag_url_hash?: string,
            timeline: [{event:'call'|'resolve'|'reject', ts:number}],
            error?: { code?: string, message?: string }
          }
        - Claim TTL: enforce short window between ad resolve and `/level/bonus/claim` (config: `claim_ttl_seconds`). Rate‑limit ad attempts and claims.
        - Traffic partner S2S postbacks (PropellerAds): optional server‑side GET to provider to report conversions for campaign optimization per guide [link](https://help.propellerads.com/en/articles/1954809-how-to-integrate-propellerads-s2s-conversion-tracking).
          • `game_config` keys: `propellerads_postback_base`, `aid`, `tid`, `enable_postback`, `goal_mappings` (e.g., { first_auth:1, level_10:2 }).
          • On qualifying events (e.g., first auth and milestone levels), call `enqueue_partner_postback(user_id,'propellerads', subid, goal)`; background job builds URL `conversion.php?aid=<aid>&pid=&tid=<tid>&visitor_id=<subid>&goal=<n>` and sends.
          • Idempotency via UNIQUE(user_id,provider,goal); retry with backoff; stop on 4xx; log `http_code` and `response_hash`.

        - Effects & expirations: when `reward_events.effective_payload` contains a temporary coin multiplier, create `active_effects` with `expires_at`. Update `user_counters.coin_multiplier` projection accordingly. A periodic job purges expired effects and recomputes the projection safely.
        - `apply_tap_batch` transaction:
          • Lock `user_counters` row; verify `session_epoch` equality; check client_seq monotonicity (relative to stored last_applied_seq in current epoch); clamp deltas; update coins/level; write `tap_batches` (status).
          • If level increases, insert `level_events` (bonus_offered=true, reward_payload with base bonuses), and unlock tasks (update `task_progress` to available where unlock_level ≤ level and active=true).
        - Tickets: stored in `user_counters.tickets`; increments allowed via reward events; sinks disabled in v1.
        - Leaderboard: job refreshes `leaderboard_global` from `user_counters.level` on schedule.

    5. Resolved defaults & policies
         - Batch window: flush interval T=150ms (config: `batch_flush_ms=150`); batch size N configurable (default 20).
         - Numeric ranges: `coins`/`total_taps` are bigint; no caps.
         - Coin multiplier stacking: policy‑driven (additive or multiplicative) in `game_config.level_bonus_policy`; temporary effects supported via `active_effects` with `expires_at`.
         - Level bonus multiplier: default from config; no min/max; no campaign overrides in v1.
         - Attribution dedupe: first value wins; later values ignored.
         - Retention: keep `tap_batches`, `ad_events`, `reward_events` indefinitely.
         - Multi‑device: solved via `session_epoch` single‑active‑session policy.
         - Ad provider: Monetag SDK integrated as primary.
         - Leaderboard exposure: return top K only; include the requesting user’s rank; display names only (no '@' usernames). Also return a count of "active players" for the most recent window (default: 1 day; configurable via `leaderboard_active_window_days`).

6. /docs/api-contracts.md (edge functions)  
   1. Conventions (all endpoints under /v1)
        - Auth header: `Authorization: Bearer <Supabase JWT>` unless noted as public/service role
        - Idempotency header for mutating POSTs: `X-Idempotency-Key: <uuidv7>`
        - Session headers for gameplay POSTs: `X-Session-Id`, `X-Session-Epoch`
        - Errors: 400 invalid, 401 unauthorized, 403 forbidden, 409 business conflict, 422 validation, 429 rate-limited, 500 server

   2. Routes
        - POST /v1/auth/tg (public)
          Request:
          ```json
          { "initDataRaw": "<tma_payload>" }
          ```
          Response 200:
          ```json
          { "jwt": "<token>", "user": { "id": "<uuid>" } }
          ```

        - POST /v1/session/start (auth)
          Request:
          ```json
          { "sessionId": "<uuid-optional>" }
          ```
          Response 200:
          ```json
          { "sessionId": "<uuid>", "sessionEpoch": "<uuid>", "lastAppliedSeq": 0 }
          ```

        - POST /v1/session/claim (auth)
          Request:
          ```json
          { "sessionId": "<uuid>" }
          ```
          Response 200: same as session/start

        - POST /v1/ingest/taps (auth)
          Headers: X-Session-Id, X-Session-Epoch, X-Idempotency-Key
          Request:
          ```json
          { "clientSeq": 123, "taps": 20, "coinsDelta": 20, "checksum": "sha256:<hex>" }
          ```
          Response 200:
          ```json
          {
            "counters": { "coins": 1234, "tickets": 0, "coinMultiplier": 1.0, "level": 3, "totalTaps": 5678 },
            "nextThreshold": { "level": 4, "coins": 4000 },
            "leveledUp": { "level": 3, "rewardPayload": { "coins": 100000, "tickets": 2 } }
          }
          ```
          Response 409 examples:
          ```json
          { "code": "SUPSERSEDED" } | { "code": "SEQ_GAP" } | { "code": "DUPLICATE" }
          ```

        - GET /v1/counters (auth)
          Response 200:
          ```json
          { "counters": { "coins": 1234, "tickets": 0, "coinMultiplier": 1.0, "level": 3, "totalTaps": 5678 },
            "effects": [ { "type": "coin_multiplier", "magnitude": 1.5, "expiresAt": "2025-01-01T00:00:00Z" } ],
            "nextThreshold": { "level": 4, "coins": 4000 }
          }
          ```

        - POST /v1/ad/log (auth, optional)
          Request:
          ```json
          { "adEventId": "<uuid>", "provider": "monetag", "placement": "level_up_bonus", "payload": { "reward_event_type": "valued" } }
          ```
          Response 200: `{}`

        - POST /v1/level/bonus/claim (auth)
          Headers: X-Session-Id, X-Session-Epoch, X-Idempotency-Key
          Request:
          ```json
          { "level": 3, "adEventId": "<uuid>", "bonusMultiplier": 2.0 }
          ```
          Response 200:
          ```json
          { "rewardEventId": "<uuid>", "counters": { "coins": 2234, "tickets": 2, "coinMultiplier": 1.0, "level": 3, "totalTaps": 5678 } }
          ```
          Response 409: `{ "code": "ALREADY_CLAIMED" } | { "code": "TTL_EXPIRED" }`

        - GET /v1/tasks (auth)
          Response 200:
          ```json
          { "definitions": [ { "taskId": "<uuid>", "unlockLevel": 2, "kind": "in_app", "rewardPayload": { "coin_multiplier": 0.2 } } ],
            "progress": [ { "taskId": "<uuid>", "state": "available" } ] }
          ```

        - POST /v1/tasks/{taskId}/claim (auth)
          Headers: X-Session-Id, X-Session-Epoch, X-Idempotency-Key
          Response 200 (verification=none):
          ```json
          { "state": "claimed", "rewardEventId": "<uuid>", "counters": { "coins": 2234, "tickets": 2, "coinMultiplier": 1.2, "level": 3, "totalTaps": 5678 } }
          ```
          Response 200 (verification=pending): `{ "state": "pending" }`

        - GET /v1/config (auth)
          Response 200:
          ```json
          { "thresholds": { "base": 1000, "growth": "linear" },
            "policies": { "level_bonus_policy": { "coins": "multiply", "tickets": "add", "coin_multiplier": "multiply" } },
            "flags": { "enableTasks": true },
            "monetag": { "zoneId": 123456, "fn": "show_123456" },
            "leaderboard": { "activeWindowDays": 1 }
          }
          ```

        - POST /v1/track/lead (public)
          Request:
          ```json
          { "campaignId": "abc", "provider": "propellerads", "subid": "<clickId>", "meta": { "zoneid": "..." } }
          ```
          Response 200: `{}`

        - GET /v1/leaderboard?top=K&windowDays=1 (auth)
          Response 200:
          ```json
          { "top": [ { "userId": "<uuid>", "name": "Alice", "level": 12 } ],
            "me": { "rank": 987, "level": 7 },
            "activePlayers": 15234 }
          ```

        - POST /v1/partners/propellerads/enqueue (service role)
          Request:
          ```json
          { "userId": "<uuid>", "subid": "<clickId>", "goal": 1 }
          ```
          Response 200: `{ "queued": true }`

        - GET /v1/health (public) → `{ "ok": true }`
        - POST /v1/jobs/partner-postbacks/retry?limit=N (service role) → `{ "retried": N }`

7. /docs/env.example  
   1. Runtime environment variables (app + edge)
        Client (safe to expose; used by Next.js/Telegram WebApp):
        - NEXT_PUBLIC_SUPABASE_URL: Supabase API URL (public)
        - NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase anon key (public; RLS must be enabled)  
        - NEXT_PUBLIC_MONETAG_ZONE_ID: Monetag zone id (public)
        - NEXT_PUBLIC_MONETAG_FN: Monetag global function name (e.g., show_123456) (public)
        - NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS: default active window for leaderboard meta (e.g., 1)

        Edge Functions (secrets; set via Supabase Secrets):
        - SUPABASE_URL: project API URL [default provided]
        - SUPABASE_SERVICE_ROLE_KEY: service role key (never in browser) [secret]
        - TELEGRAM_BOT_TOKEN: bot token for initData validation [secret]
        - INITDATA_TTL_SECONDS: TTL for initData validation (e.g., 3600)
        - CLAIM_TTL_SECONDS: TTL allowed between ad resolve and claim (e.g., 180)
        - PROPELLERADS_POSTBACK_BASE: base URL for S2S postback (e.g., http://ad.propellerads.com/conversion.php) [secret]
        - PROPELLERADS_AID: advertiser id [secret]
        - PROPELLERADS_TID: token id [secret]
        - ENABLE_PROPELLERADS_POSTBACK: true/false
        - BATCH_FLUSH_MS: default 150
        - MONETAG_ZONE_ID: duplicate of client value if needed server‑side
        - MONETAG_PROVIDER: monetag

        CI/Tooling (local only; not committed):
        - SUPABASE_ACCESS_TOKEN: token for CLI deploys [secret]

        Notes:
        - Maintain two files: `.env.local` (Next.js dev) and `supabase/.env.local` (Edge). Never commit secrets; use `supabase secrets set --env-file` to upload [docs].  
          References: set/list secrets with CLI [docs].

8. /docs/deploy-pipeline.md  
   1. Hosting
        - Frontend: Vercel (production branch: main)
        - Backend: Supabase (Postgres, Auth, Edge Functions)

   2. Environment propagation
        - Set Vercel envs: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MONETAG_ZONE_ID`, `NEXT_PUBLIC_MONETAG_FN`, `NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS` [public]
        - Set Supabase Edge secrets via CLI:
          ```
          supabase link --project-ref <PROJECT_REF>
          supabase secrets set --env-file supabase/.env.local
          supabase secrets list
          ```
          References: Supabase secrets management and CLI commands [docs].

   3. Build & deploy
        - Vercel: push to main triggers build; preview per PR
        - Supabase: deploy functions as needed:
          ```
          supabase functions deploy --project-ref <PROJECT_REF>
          ```

   4. Post‑deploy smoke checks
        - /v1/health returns ok
        - /v1/auth/tg validates sample initData (staging)
        - /v1/session/start → /v1/ingest/taps happy path (single batch)
        - level‑up bonus claim flow with Monetag mock (ensure TTL policy)
        - GET /v1/leaderboard returns top K and user rank

   5. Observability & rollback
        - Metrics: 2xx/4xx/5xx per endpoint, rate‑limit hits, epoch conflicts, claim TTL rejects
        - Logs: idempotencyKey, sessionId, userId (hashed), requestId
        - Rollback: feature flags for tasks, partner postbacks, ad logging

   6. Security reminders
        - Never expose `SUPABASE_SERVICE_ROLE_KEY` in client
        - `.env` files excluded from VCS; loaded locally with `supabase functions serve --env-file`
        - Avoid logging full secrets; print truncated hashes for verification [docs]

9.  CHANGELOG & /tasks protocol (confirmation)  
   1. Any deviations from the Development & Documentation Protocol summarized in DDP.md?  
          No.

