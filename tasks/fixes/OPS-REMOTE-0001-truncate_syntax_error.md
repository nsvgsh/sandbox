# OPS-REMOTE-0001 — Supabase TRUNCATE IF EXISTS syntax error

## Problem
Running `ops/remote-setup.sql` in Supabase fails with:

```
ERROR: 42601: syntax error at or near "exists"
LINE 24: truncate table if exists ... RESTART IDENTITY CASCADE;
```

Postgres does not support `TRUNCATE TABLE IF EXISTS` (unlike `DROP ... IF EXISTS`).

## Root Cause
The script attempted to use `TRUNCATE ... IF EXISTS`, which is invalid SQL in Postgres and thus rejected by Supabase/Postgres parser.

## Proposed Fix
Replace the single `TRUNCATE ... IF EXISTS ... RESTART IDENTITY CASCADE` statement with a defensive `DO $$ BEGIN ... END $$;` block that individually truncates each table, catching `undefined_table` to allow running on fresh databases.

## Implementation
- Edited `ops/remote-setup.sql` to wrap per-table `TRUNCATE TABLE ... RESTART IDENTITY CASCADE` statements in `BEGIN ... EXCEPTION WHEN undefined_table THEN END;` blocks.
- Updated generator `ops/local-db.mjs` to emit the same safe DO block so future runs of `ops/local-db.sh` produce a compatible `ops/remote-setup.sql`.

## Result
Script runs in Supabase without syntax errors and safely resets state even if some tables do not yet exist.

## Affected Files
- `ops/remote-setup.sql`
- `ops/local-db.mjs`

## How to Reproduce (before fix)
1. Open Supabase SQL editor and run `ops/remote-setup.sql` with the `TRUNCATE ... IF EXISTS` statement.
2. Observe syntax error at `exists`.

## Verification (after fix)
1. Run orchestrator to regenerate and apply:
   ```bash
   ./ops/local-db.sh
   ```
2. Inspect `ops/remote-setup.sql` and confirm it contains a `DO $$ BEGIN ... TRUNCATE TABLE ... END $$;` block for truncation.
3. Execute the regenerated `ops/remote-setup.sql` in Supabase; it should complete without syntax errors.

## Risks / Notes
- This is a full reset of the current database. Use only in non‑production or with explicit confirmation.
- The DO block ignores `undefined_table` to allow first‑run scenarios where tables may not exist yet.

## Changelog
- Added entry: `OPS-REMOTE-0001 | Fixed Supabase run error: replaced invalid TRUNCATE IF EXISTS with safe DO block`.

