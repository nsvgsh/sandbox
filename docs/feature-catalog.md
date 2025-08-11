# Feature Catalog (v1)

## Core Gameplay
- Tapping and coin accrual
  - Source: docs/game-design.md (Core loop, Currencies), api-contracts.md (/ingest/taps)
  - Entities: user_counters.coins, total_taps, coin_multiplier
  - Acceptance: server computes coins; idempotent via tap_batches; clamps per game_config.ingest

- Level thresholds and auto-conversion
  - Source: game-design.md (Progression), api-contracts.md (GET /counters), db-schema.sql (_next_threshold, user_counters.level)
  - Acceptance: nextThreshold reflects configured policy; excess coins carry over

- Level-up reward snapshot and bonus offer
  - Source: game-design.md (Rewards policy), db-schema.sql (level_events, reward_events)
  - Acceptance: base reward persisted at level-up; bonus eligibility within TTL; multiplier applies incremental portion

## Ads & Bonus
- Ad events logging and bonus auto-apply path
  - Source: api-contracts.md (POST /ad/log, POST /level/bonus/claim)
  - Entities: ad_events, level_events, reward_events
  - Acceptance: completed ad within TTL enables single bonus claim; idempotent by impressionId/idempotency key

## Tasks
- Task definitions exposure and claim
  - Source: api-contracts.md (GET /tasks, POST /tasks/{taskId}/claim), db-schema.sql (task_definitions, task_progress)
  - Acceptance: state derives from unlock level and progress; ad view required for ad-type tasks; claim updates counters and ledger

## Leaderboard
- Global leaderboard read model
  - Source: api-contracts.md (GET /leaderboard), db-schema.sql (leaderboard_global)
  - Acceptance: returns top, me (rank), activePlayers over configured window

## Sessions
- Session lifecycle for gameplay
  - Source: api-contracts.md (POST /session/start, /session/claim), code (session/start route)
  - Acceptance: start returns sessionId, sessionEpoch, lastAppliedSeq; headers present on gameplay posts

## Configuration & Admin
- Public config exposure
  - Source: api-contracts.md (GET /config), db (game_config)
  - Acceptance: thresholds, policies, flags are returned; used by clients

- Admin thresholds tuning
  - Source: admin tools (admin/config/thresholds)
  - Acceptance: dev-token gated; updates game_config.thresholds

## Health
- Liveness endpoint
  - Source: api-contracts.md (GET /health)
  - Acceptance: returns ok: true

## Attribution
- Lead tracking (stubbed)
  - Source: api-contracts.md (POST /track/lead), db-schema.sql (attribution_leads)
  - Acceptance: enqueue or write lead on signal; out of scope in current code

## Out of Scope Confirmed
- Payments, Stars, PvP, advanced anti-cheat, push, daily goals, seasons, premium currency


