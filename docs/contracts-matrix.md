# Contracts Matrix (/v1)

Columns: Route | Method | Request | Headers | Response | Errors | Idempotency | Auth | DB touchpoints | Notes

| Route | Method | Request | Headers | Response | Errors | Idempotency | Auth | DB | Notes |
|---|---|---|---|---|---|---|---|---|---|
| /auth/dev | POST | none | x-dev-token | { userId } sets dev_session cookie | 403 | n/a | open (dev) | none | local only |
| /session/start | POST | none | cookie dev_session | { sessionId, sessionEpoch, lastAppliedSeq } | 401 | n/a | required | session_start() | sets epoch |
| /ingest/taps | POST | { taps, clientSeq, checksum, sessionId, sessionEpoch } | X-Idempotency-Key | { counters, nextThreshold, leveledUp? } | 400/401/409/429/500 | key required; server generates if missing | required | apply_tap_batch(); tap_batches; user_counters; level_events | clamps via game_config.ingest |
| /counters | GET | - | cookie dev_session | { counters, nextThreshold } | 401 | n/a | required | user_counters; _next_threshold() | read path |
| /ad/log | POST | { provider, placement, status, impressionId } | - | { applied, counters? } | - | impressionId as idem | required | ad_events; claim_level_bonus() | soft auto-apply bonus |
| /level/bonus/claim | POST | { level, bonusMultiplier } | X-Idempotency-Key | { rewardEventId, counters, nextThreshold } | 400/401/404/409/500 | required | required | claim_level_bonus(); reward_events | ALREADY_CLAIMED/TTL_EXPIRED |
| /tasks | GET | - | cookie dev_session | { definitions, progress, userLevel } | 401 | n/a | required | task_definitions, task_progress, user_counters | merges state |
| /tasks/{taskId}/claim | POST | path param | cookie dev_session | { state, counters } | 400/401/404/409/500 | claim_task() ensures | required | claim_task(); ad_events TTL | AD_REQUIRED policy |
| /config | GET | - | - | { thresholds, policies, flags, monetag, leaderboard } | - | n/a | open | game_config | merges rows |
| /leaderboard | GET | ?top | cookie dev_session optional | { top, me, activePlayers } | - | n/a | optional | leaderboard_global | env window days |
| /admin/config/thresholds | POST | { base?, batchMinIntervalMs? } | x-dev-token | { thresholds } | 400/403 | n/a | dev-only | game_config | updates JSON |
| /admin/debug/state | GET | x-dev-token, x-user-id | { counters, lastLevel, leaderboard, config, nextTemplates } | 400/403 | n/a | dev-only | multiple | preview templates |
| /health | GET | - | - | { ok: true } | - | n/a | open | none | liveness |

Open in docs, not yet implemented in code:
- /auth/tg (POST) → Edge Function in docs; not present in Next routes
- /session/claim (POST) → documented, missing in code
- /track/lead (POST) → documented, missing in code; DB table exists
- /partners/propellerads/enqueue (service) → documented, missing in code


