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
- POST /level/bonus/claim → { rewardEventId, counters }
- GET /tasks → { definitions, progress }
- POST /tasks/{taskId}/claim → { state, rewardEventId?, counters? }
- GET /config → { thresholds, policies, flags, monetag, leaderboard }
- POST /track/lead → {}
- GET /leaderboard?top=K → { top, me, activePlayers }  (windowDays is configured via env)
- POST /partners/propellerads/enqueue (service) → { queued }
- GET /health → { ok: true }
