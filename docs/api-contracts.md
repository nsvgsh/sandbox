# API contracts (/v1)

Conventions
- Auth: `Authorization: Bearer <Supabase JWT>`
- Idempotency: `X-Idempotency-Key` on mutating POSTs (uuidv7)
- Session: `X-Session-Id`, `X-Session-Epoch` on gameplay POSTs
- Errors: 400/401/403/409/422/429/500

## Routes
- POST /auth/tg → { jwt, user }
- POST /session/start → { sessionId, sessionEpoch, lastAppliedSeq }
- POST /session/claim → { sessionId, sessionEpoch, lastAppliedSeq }
- POST /ingest/taps → { counters, nextThreshold, leveledUp? }
- GET /counters → { counters, effects?, nextThreshold }
- POST /ad/log → { applied, counters? }
  - Body accepts optional `intent`: `"level_bonus"` or `"task:<taskId>"` for intent‑coupled local simulation.
- POST /level/bonus/claim → { rewardEventId, counters }
- GET /tasks → { definitions, progress }
- POST /tasks/{taskId}/claim → { state, rewardEventId?, counters? }
  - Ad‑gated tasks: recent completed ad must match `intent='task:<taskId>'` within TTL; otherwise `AD_REQUIRED`.
- GET /config → { thresholds, policies, flags, monetag, leaderboard }
- POST /track/lead → {}
- GET /leaderboard?top=K → { top, me, activePlayers }  (windowDays is configured via env)
- POST /partners/propellerads/enqueue (service) → { queued }
- GET /health → { ok: true }

## Task verification (policy)
- Grant rewards instantly on claim based on in‑app signals; do not block on partner answers.
- If a partner later pings, record `confirmed/rejected/unknown` for reporting only; never adjust user rewards.
- Keep it simple: one shared marker, ignore duplicates, light caps/window via config, no periodic checks.
