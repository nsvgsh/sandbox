## Fix Ticket: apply_tap_batch — "column reference 'level' is ambiguous"

### Problem
`POST /api/v1/ingest/taps` returns 500 with message: `column reference "level" is ambiguous` after introducing the Free Trial schedule logic.

### Root Cause
In the overridden `apply_tap_batch`, the query `select * from level_offer_schedule where level = v_level and active is true` used an unqualified `level` identifier inside PL/pgSQL. Because the function has an OUT parameter named `level`, the unqualified `level` became ambiguous between the output parameter and the table column.

### Proposed Fix
Qualify the column with a table alias: `from level_offer_schedule s where s.level = v_level and s.active is true`. Redeploy the function via a small migration.

### Acceptance Criteria
- `POST /api/v1/ingest/taps` no longer errors with ambiguity.
- Level-up behavior continues to skip base rewards for scheduled levels.


