# Runtime Config Admin — one-shot config → SQL

This tool manages runtime config in `game_config` that is not covered by `ops/game-admin` or `ops/integrations-admin`.

Files:
- input.json: editable parameters (ad_ttl_seconds, coins_per_tap, thresholds, tap_agg, ingest, hud_tween_ms, level_bonus_policy)
- output.sql: generated SQL to apply
- (script) web/scripts/build-runtime-config-sql.mjs

## Step-by-step
1) Edit inputs
```json
{
  "ad_ttl_seconds": 10,
  "coins_per_tap": 100,
  "hud_tween_ms": 160,
  "thresholds": { "base": 10, "growth": "linear", "batch_min_interval_ms": 500 },
  "tap_agg": { "flush_threshold": 20, "tween_ms_min": 80, "tween_ms_max": 180 },
  "ingest": { "max_taps_per_batch": 50, "clamp_soft": true },
  "level_bonus_policy": { "coins": "multiply", "tickets": "add", "coin_multiplier": "multiply" }
}
```

2) Generate SQL
```bash
node web/scripts/build-runtime-config-sql.mjs --in ops/runtime-config-admin/input.json --out ops/runtime-config-admin/output.sql
```

3) Apply to DB
```bash
psql "$DATABASE_URL" -f ops/runtime-config-admin/output.sql
# or
supabase db query --file ops/runtime-config-admin/output.sql
```

## Notes
- All updates are idempotent.
- Values mirror `/api/v1/config` keys.
