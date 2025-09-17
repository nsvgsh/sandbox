# Deploy pipeline

## Hosting
- Frontend: Vercel (production branch: main)
- Backend: Supabase (Postgres, Auth, Edge Functions)

## Environment propagation
- Vercel (envs used by this app):
  - DATABASE_URL (required in prod): use Supabase Pooler connection (port 6543). SSL is enforced by the app; no need to append `sslmode=require`.
  - NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS (optional; default 1)
  - (Reserved for future supabase-js usage) NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  - (Reserved for admin flows) SUPABASE_SERVICE_ROLE_KEY
  - (Reserved for Telegram login) TELEGRAM_BOT_TOKEN
- Supabase Edge secrets (CLI) — not used by current app version, kept for reference:
  ```
  supabase link --project-ref <PROJECT_REF>
  supabase secrets set --env-file supabase/.env.local
  supabase secrets list
  ```

## Build & deploy
- Vercel: push to main triggers build; preview per PR
- Supabase functions (not used in this app version):
  ```
  supabase functions deploy
  ```

## Monetag (prod)
- Configuration is sourced from DB `game_config` via `/v1/config`, not from env.
- SQL (run once in Supabase SQL Editor):
  ```sql
  -- Enable Monetag
  insert into game_config(key, value)
  values ('monetag_enabled', 'true'::jsonb)
  on conflict (key) do update set value = excluded.value;

  -- Set main zone id (replace with your MAIN_ZONE_ID)
  insert into game_config(key, value)
  values ('monetag_zone_id', '"YOUR_MAIN_ZONE_ID"'::jsonb)
  on conflict (key) do update set value = excluded.value;

  -- Set SDK URL (replace with your SDK url)
  insert into game_config(key, value)
  values ('monetag_sdk_url', '"https://your.domain/sdk.js"'::jsonb)
  on conflict (key) do update set value = excluded.value;

  -- Optional: unlock policy (any|valued)
  insert into game_config(key,value)
  values ('unlock_policy', '"any"'::jsonb)
  on conflict (key) do update set value = excluded.value;

  -- Optional: log failed ad events
  insert into game_config(key,value)
  values ('log_failed_ad_events', 'true'::jsonb)
  on conflict (key) do update set value = excluded.value;
  ```
- Checklist:
  - [ ] `monetag_enabled` = true
  - [ ] `monetag_zone_id` set to MAIN zone id
  - [ ] `monetag_sdk_url` set and reachable from client
  - [ ] `ad_ttl_seconds` has desired value (defaults seeded; adjust via SQL if needed)
  - [ ] Smoke flows: level bonus → ad/log → bonus claim; tasks → ad/log → claim

## Smoke checks
- GET /v1/health → ok
- POST /v1/auth/dev (local) with dev token → 200 sets cookie
- POST /v1/session/start → returns ids; then POST /v1/session/claim with same ids → echoes; with random epoch → rotates
- POST /v1/ingest/taps → 200 and nextThreshold
- Level-up path: reach level, then POST /v1/ad/log with intent="level_bonus" → returns impressionId; POST /v1/level/bonus/claim with that impressionId within `ad_ttl_seconds` → bonus applied; UI shows Claim x2 countdown
- Task path (intent-coupled): GET /v1/tasks (pick available), POST /v1/tasks/{id}/claim → 409 AD_REQUIRED; POST /v1/ad/log with intent="task:{id}" → POST /v1/tasks/{id}/claim → 200
- GET /v1/leaderboard → top K, rank, activePlayers

## Observability & rollback
- Metrics: 2xx/4xx/5xx per endpoint, rate‑limit hits, epoch conflicts, ad TTL rejects (TTL_EXPIRED)
- Logs: idempotencyKey, sessionId, userId (hashed), requestId
- Feature flags: disable tasks, partner postbacks, ad logging; switch bonus path v2/v3 for rollback

## Security
- Never expose SUPABASE_SERVICE_ROLE_KEY in client
- `.env` files never committed; manage with Supabase secrets CLI
- Avoid logging full secrets; print truncated hashes only
- Local dev: set both `NEXT_PUBLIC_DEV_TOKEN` and `DEV_TOKEN` to the same value so admin/debug endpoints authorize
