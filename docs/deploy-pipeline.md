# Deploy pipeline

## Hosting
- Frontend: Vercel (production branch: main)
- Backend: Supabase (Postgres, Auth, Edge Functions)

## Environment propagation
- Vercel (client envs):
  - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
  - NEXT_PUBLIC_MONETAG_ZONE_ID, NEXT_PUBLIC_MONETAG_FN
  - NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS
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
- POST /v1/auth/tg (staging) with sample initData → 200
- POST /v1/session/start → POST /v1/ingest/taps → 200
- Simulated level‑up → Monetag resolve → POST /v1/level/bonus/claim within TTL
- GET /v1/leaderboard → top K, rank, activePlayers

## Observability & rollback
- Metrics: 2xx/4xx/5xx per endpoint, rate‑limit hits, epoch conflicts, claim TTL rejects
- Logs: idempotencyKey, sessionId, userId (hashed), requestId
- Feature flags: disable tasks, partner postbacks, ad logging on incidents

## Security
- Never expose SUPABASE_SERVICE_ROLE_KEY in client
- `.env` files never committed; manage with Supabase secrets CLI
- Avoid logging full secrets; print truncated hashes only
