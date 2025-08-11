# Implementation Plan — GD-ALIGN-HIPRI

## Architectural Analysis
- SQL is the source of truth for progression. Tap ingestion must compute coins from taps × coins_per_tap × coin_multiplier.
- Thresholds are config-driven; unify `nextThreshold` calculation via SQL helper.
- Level-up should snapshot a per-level reward template and grant base rewards immediately; ad-gated bonus applies only the incremental over granted base.
- Tasks are ad-view by default; claim must require a recent ad event and be idempotent.

## Task List
- DB/migrations
  - Added `game_config` defaults: thresholds.base=10, `coins_per_tap`, `ad_ttl_seconds`, `ingest` (max_taps_per_batch, clamp_soft).
  - Added `level_reward_templates` table; added `template_id` to `level_events`.
  - Updated `apply_tap_batch` to compute earnings and grant base rewards at level-up using templates.
  - Updated `claim_level_bonus` to apply only incremental amounts and to be idempotent via key.
- API
  - `/api/v1/ingest/taps`: removed coinsDelta; added soft clamp logs from `game_config.ingest`.
  - `/api/v1/counters`: unified next-threshold via SQL helper.
  - `/api/v1/level/bonus/claim`: uses SQL helper for next-threshold in response.
  - `/api/v1/ad/log`: records ad event and auto-applies the latest eligible level bonus (stub; local only).
  - `/api/v1/tasks`: returns unlock-gated states; `/tasks/{id}/claim` requires a recent ad.
  - `/api/v1/leaderboard`: returns `me` rank and `activePlayers`.
  - `/api/v1/admin/debug/state`: returns config subset and `nextTemplates` for preview.
- Seeds
  - Seeded milestone templates and example tasks (coins L1, multiplier L2).

## Documentation Impact
- Update `docs/api-contracts.md` for the revised endpoints (leaderboard meta, debug state additions).
- Update `docs/db-schema.sql` and `docs/db-models.md` to reflect `level_reward_templates`, `template_id`, and broadened `ad_events.status` values for local stub.
- Update `docs/game-design.md` Rewards policy section to reflect immediate base grant and incremental bonus.
- README/dev notes: soft-mode for checksum/clamp; ad stub flows and curl examples.
