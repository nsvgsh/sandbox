| DOCS-BASELINE | Created README, app-overview, game-design, telegram-integration, db-models, db-schema.sql, api-contracts, env.example, deploy-pipeline |
| LOCAL-BOOTSTRAP | Local dev stack scaffolded (Next.js app, Supabase CLI Postgres, API routes, dev login) |
| GD-ALIGN-HIPRI-1 | Server-side coin earning (taps × coin_multiplier), removed client coinsDelta, thresholds base from config (default 10) |
| REWARD-POLICY | Implemented server-side reward policy; claim idempotency; banked coins; multiplied tickets; updated docs |
| ADMIN-TOOLS | Added local admin endpoints for thresholds and debug state |
| HOTPATH-TICKETS | Apply base tickets on level-up during ingest |
| GD-ALIGN-HIPRI | Aligned core loop: server-side tap earnings, thresholds base=10, unified next-threshold |
| LVL-TEMPLATES | Per-level reward templates; base grant on level-up; snapshot in level_events |
| AD-STUB | Auto-apply incremental level bonus on ad_completed (local) |
| TASKS-AD-VIEW | Enforced ad requirement on task claim; updated counters on claim |
| INGEST-SOFT | Soft clamp taps and checksum awareness via game_config.ingest |
| LEADERBOARD-META | Returned me rank and activePlayers in leaderboard |
| ADMIN-TOOLS | Debug state includes nextTemplates and config subset |
| DOCS-TRACE-FOUNDATION | Added Feature Catalog under docs/feature-catalog.md |
| SESSION-CLAIM | Added POST /v1/session/claim endpoint to safely resume sessions and return authoritative ids |
