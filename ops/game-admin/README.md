# Game Admin – one-shot config → SQL flow

This folder hosts the admin flow to update game parameters without code deploys.

Files:
- input.json: your editable parameters (coins_per_tap, thresholds_poly, level_rewards, free_trial, tasks)
- output.sql: generated one-transaction SQL to apply in DB
- (script) web/scripts/build-game-sql.mjs: generator

## Step-by-step
1) Edit inputs
- Open `ops/game-admin/input.json` and fill values:
  - coins_per_tap: positive number
  - thresholds_poly: { a0, a1, a2, a3 } numbers (polynomial coefficients)
  - level_rewards: [{ level, payload: { coins?, tickets?, coin_multiplier? } }]
- free_trial: [{ level, active, skip_base_reward, payload}] — controls level-up modal & flow only (does not add Earn tasks)
  - tasks: [{ task_id (uuid), unlock_level, kind, reward_payload, verification, active }]

1) Generate SQL
```bash
node web/scripts/build-game-sql.mjs --in ops/game-admin/input.json --out ops/game-admin/output.sql
```
If validation fails, the script prints errors and exits non‑zero.

1) Apply to DB
- Using psql:
```bash
psql "$DATABASE_URL" -f ops/game-admin/output.sql
```
- Or Supabase CLI:
```bash
supabase db query --file ops/game-admin/output.sql
```

## Notes
- Thresholds: runtime function `_threshold_for_level(L)` reads `game_config.thresholds_poly` with defaults; no migrations are needed to change coefficients.
- No-spend: level-ups use absolute thresholds; coins are not subtracted.
- coin_multiplier in any payload is ABSOLUTE set (overwrites current multiplier). Bonus x2 does not affect multiplier (applies to coins/tickets only).
- Free Trial schedule (modal) does not unlock Earn claim; Earn Free Trial tasks require their own click (placement=earn_tile, intent=task:<id>) and Claim.
- Free Trial level-up modal redirect is level-based: `/api/v1/offer/free-trial/level/{level}/modal-redirect` (modal does not require task_id).
- Idempotent UPSERTs: safe to re-run with the same input.
- Replacement semantics: templates and tasks not present in input are deleted; Free Trial schedule is fully replaced for partner_key='free_trial'.
- Earn list is formed strictly from `tasks`. Sync of `free_trial` into tasks is disabled by default.
