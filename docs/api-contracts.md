# API contracts (/v1)

Conventions
- Auth: `Authorization: Bearer <Supabase JWT>`
- Idempotency: `X-Idempotency-Key` on mutating POSTs (uuidv7)
- Session: `X-Session-Id`, `X-Session-Epoch` on gameplay POSTs
- Errors: 400/401/403/409/422/429/500
- TTLs: `ad_ttl_seconds` (default 10s) governs all time‑gated claims (level bonus x2, tasks). `claim_ttl_seconds` is deprecated and not used for bonus claims.
- Config source: clients read timers/limits from `GET /v1/config`. Any UI countdowns are advisory; the server is authoritative.

## Routes
- POST /auth/tg → { jwt, user }
- GET /level/last → { level, rewardPayload }
- POST /session/start → { sessionId, sessionEpoch, lastAppliedSeq }
  - Optional header: `x-startapp: <payload>` — persists attribution (PropellerAds) and triggers S2S postback.
- POST /session/claim → { sessionId, sessionEpoch, lastAppliedSeq }
  - Optional header: `x-startapp: <payload>` — same attribution semantics as `session/start`.
- POST /ingest/taps → { counters, nextThreshold, leveledUp? }
  - Clients may send coalesced tap counts (`taps > 1`). Server applies idempotency/seq as usual and returns authoritative counters.
- GET /counters → { counters, effects?, nextThreshold }
- POST /ad/log → { recorded, impressionId }
  - Body accepts optional `intent`: `"level_bonus"` or `"task:<taskId>"`.
  - Persists `ad_events` with `status='closed'|'failed'` and stores provider payload; does not return TTL.
- POST /level/bonus/claim → { rewardEventId?, counters }
  - Applies incremental x2 when a recent ad exists where `now < ad_events.created_at + ad_ttl_seconds`.
  - Send `impressionId` from `/ad/log` and use it as idempotency key (`X-Idempotency-Key`).
  - Errors: 409 `TTL_EXPIRED`, 409 `ALREADY_CLAIMED`, 404 `NOT_FOUND`.
- GET /tasks → { definitions, progress }
- POST /tasks/{taskId}/claim → { state, rewardEventId?, counters? }
  - Ad‑gated tasks: recent completed ad must match `intent='task:<taskId>'` within TTL; otherwise `AD_REQUIRED`.
  - Free Trial partner tasks: no TTL; require a completed redirect click with intent `task:<taskId>`; latest eligible click is consumed.
  - Free Trial idempotency: server ignores client `X-Idempotency-Key` and uses the matched `ad_events.id` as the idempotency key.
  - Spend‑once: the matched ad is marked `used` on successful claim.
  - Idempotency: send `X-Idempotency-Key` (recommend using the ad `impressionId`). Duplicate claims with the same key do not grant twice.
  - Errors: 409 `ALREADY_CLAIMED` (task already claimed), 409 `AD_REQUIRED`, 404 `NOT_FOUND`.
- GET /offer/free-trial/{taskId}/redirect → 302
  - Reads URL template and source from config; generates UUIDv4 click id; records `ad_events` (`provider='free_trial'`, `placement='earn'`, `status='completed'`, `reward_payload.intent='task:<taskId>'`), then redirects with `_ocid` and `aff_subid`.
  - Restricts host to `*.himfls.com`.
  - Errors: 404 `NOT_FOUND` (unknown/inactive task), 503 `CONFIG_MISSING`, 400 `HOST_RESTRICTED|BAD_TEMPLATE`.
- GET /tasks/{taskId}/ready → { ready, claimed, lastClickAt?, clicks? }
  - For partner tasks (free_trial) reports if a redirect click exists and is unconsumed.
  - 404 when the task is not an active free_trial partner task.

- GET /config → { thresholds, policies, flags, monetag, leaderboard, coins_per_tap, hud_tween_ms }
  - thresholds: includes `batch_min_interval_ms` used by client flusher cadence and server guard.
  - ingest: may include `max_taps_per_batch`, `clamp_soft` (server‑side awareness only).
  - tap_agg: includes client UI tuning keys: `flush_threshold`, `tween_ms_min`, `tween_ms_max`.
  - coins_per_tap: number — used by clients for optimistic UI and by server for earnings.
  - hud_tween_ms: number — HUD numbers animation duration in ms (0 disables).
  - thresholds_poly: optional coefficients for runtime polynomial thresholds (server uses them; clients display nextThreshold returned by server).
- POST /track/lead → {}
  - Body: `{ userId, startapp }` where `startapp` supports:
    - `${SUBID}`
    - `${SUBID}_{device}`
    - `${SUBID}_{campaignid}_{zoneid}`
    - Legacy `${SUBID}_{campaignid}_{zoneid}_prop` (trailing `_prop` ignored)
- GET /leaderboard?top=K → { top, me, activePlayers }  (windowDays is configured via env)
- POST /partners/propellerads/enqueue (service) → { queued }
- GET /health → { ok: true }

## Task verification (policy)
- Grant rewards instantly on claim based on in‑app signals; do not block on partner answers.
- If a partner later pings, record `confirmed/rejected/unknown` for reporting only; never adjust user rewards.
- Keep it simple: one shared marker, ignore duplicates, light caps/window via config, no periodic checks.

## UI notes (local dev parity)
- Level‑up: client shows a modal on level‑up with base reward details and a two‑step x2 flow. After ad/log, the modal displays the total x2 reward for clarity; the backend still applies only the incremental portion per `level_bonus_policy` and marks the ad as `used`.
- Tasks (Offers): per‑task ad unlock with `intent='task:<id>'` is required; client shows `Claim (Xs)` within TTL and a success modal on claim. If TTL expires, the task remains in AVAILABLE and shows `Watch ad` again (no separate EXPIRED tab in the current UI).
- Free Trial: partner tiles use Redirect; claim has no TTL. A readiness check (`GET /tasks/{id}/ready`) is used to flip CTA to Claim after redirect.
- TTL countdowns in the UI are advisory; the server remains authoritative on acceptance.
