# Integrations Admin – Monetag & Free Trial

Admin flow to update Monetag and Free Trial settings without code deploys.

Files:
- input.json: editable parameters for Monetag and Free Trial
- output.sql: generated SQL to apply
- (script) web/scripts/build-integrations-sql.mjs: generator

## Step-by-step
1) Edit inputs
- Open `ops/integrations-admin/input.json` and fill values:
```json
{
  "monetag": {
    "enabled": true,
    "zone_id": "YOUR_MAIN_ZONE_ID",
    "sdk_url": "https://your.domain/sdk.js",
    "unlock_policy": "any",
    "log_failed_ad_events": true
  },
  "free_trial": {
    "url_template": "https://example.himfls.com/redirect?click={CLICKID}&source={SOURCE}",
    "source": "sandbox"
  }
}
```

2) Generate SQL
```bash
node web/scripts/build-integrations-sql.mjs --in ops/integrations-admin/input.json --out ops/integrations-admin/output.sql
```

3) Apply to DB
```bash
psql "$DATABASE_URL" -f ops/integrations-admin/output.sql
# or
supabase db query --file ops/integrations-admin/output.sql
```

## Notes
- Monetag config keys updated: `monetag_enabled`, `monetag_zone_id`, `monetag_sdk_url`, `unlock_policy`, `log_failed_ad_events`.
- Free Trial config keys updated: `free_trial_url_template`, `free_trial_source`.
- All updates are idempotent (UPSERT style).
- Replacement semantics: before inserting, existing keys above are deleted so new values replace old ones.
