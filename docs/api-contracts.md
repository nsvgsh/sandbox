# API contracts (/v1)

Conventions
- Auth: `Authorization: Bearer <Supabase JWT>`
- Idempotency: `X-Idempotency-Key` on mutating POSTs (uuidv7)
- Session: `X-Session-Id`, `X-Session-Epoch` on gameplay POSTs
- Errors: 400/401/403/409/422/429/500
- TTLs: `ad_ttl_seconds` (default 10s) governs all time‑gated claims (level bonus x2, tasks). `claim_ttl_seconds` is deprecated and not used for bonus claims.

## Routes
- POST /auth/tg → { jwt, user }
- POST /session/start → { sessionId, sessionEpoch, lastAppliedSeq }
- POST /session/claim → { sessionId, sessionEpoch, lastAppliedSeq }
- POST /ingest/taps → { counters, nextThreshold, leveledUp? }
- GET /counters → { counters, effects?, nextThreshold }
- POST /ad/log → { recorded, impressionId, expiresInSec? }
  - Body accepts optional `intent`: `"level_bonus"` or `"task:<taskId>"` for intent‑coupled local simulation.
  - For `intent='level_bonus'`, this route only records the ad and returns an `impressionId` and an advisory `expiresInSec` computed from `ad_ttl_seconds`. It does not apply rewards.
- POST /level/bonus/claim → { rewardEventId?, counters }
  - Applies the incremental x2 bonus for the most recent unclaimed level event when a recent ad (within `ad_ttl_seconds`) exists.
  - Prefer passing the `impressionId` from `/ad/log` and use it as idempotency key.
  - Errors: 409 `TTL_EXPIRED`, 409 `ALREADY_CLAIMED`, 404 `NOT_FOUND`.
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

## UI notes (local dev parity)
- Level‑up: client shows a modal on level‑up with base reward details and a two‑step x2 flow. After ad/log, the modal displays the total x2 reward for clarity; the backend still applies only the incremental portion per `level_bonus_policy` and marks the ad as `used`.
- Tasks (Offers): per‑task ad unlock with `intent='task:<id>'` is required; client shows `Claim (Xs)` within TTL and a success modal on claim. Expired unlocks are indicated locally in an EXPIRED tab (UI‑only).
- TTL countdowns in the UI are advisory; the server remains authoritative on acceptance.
