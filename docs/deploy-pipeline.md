# Deploy pipeline

## Hosting
- Frontend: Vercel (production branch: main)
- Backend: Supabase (Postgres, Auth, Edge Functions)

## Environment propagation
- Vercel (client envs):
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_MONETAG_ZONE_ID, NEXT_PUBLIC_MONETAG_FN
  - NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS
  - NEXT_PUBLIC_DEV_TOKEN (should match DEV_TOKEN locally)
- Supabase Edge secrets (CLI):
  ```
  supabase link --project-ref <PROJECT_REF>
  supabase secrets set --env-file supabase/.env.local
  supabase secrets list
  ```

## Build & deploy
- Vercel: push to main triggers build; preview per PR
- Supabase functions:
  ```
  supabase functions deploy
  ```

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
