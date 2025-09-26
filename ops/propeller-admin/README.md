# PropellerAds Admin — one-shot config → SQL

This admin flow manages PropellerAds S2S runtime configuration in `game_config` without code deploys.

Files:
- input.json: editable parameters (enabled, base_url, aid, tid, pid)
- output.sql: generated SQL to apply
- (script) web/scripts/build-propeller-sql.mjs: generator

## Step-by-step
1) Edit inputs
```json
{
  "enabled": true,
  "base_url": "http://ad.propellerads.com/conversion.php",
  "aid": "3857131",
  "tid": "145944",
  "pid": ""
}
```

2) Generate SQL
```bash
node web/scripts/build-propeller-sql.mjs --in ops/propeller-admin/input.json --out ops/propeller-admin/output.sql
```

3) Apply to DB
```bash
psql "$DATABASE_URL" -f ops/propeller-admin/output.sql
# or
supabase db query --file ops/propeller-admin/output.sql
```

## Notes
- All updates are idempotent (UPSERT style).
- The app reads these values via `game_config` keys: `propeller_enabled`, `propeller_postback_base_url`, `propeller_aid`, `propeller_tid`, `propeller_pid`.
