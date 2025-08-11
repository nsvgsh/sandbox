# Implementation Plan — LVL-TEMPLATES

## Architectural Analysis
- Keep templates in a dedicated table with (season, segment) reserved for future; snapshot payload at level-up for auditability.

## Task List
- Create `level_reward_templates` with uniqueness among active rows, add `template_id` to `level_events`.
- Resolve template per level crossed in `apply_tap_batch`; fallback to level=0 row; grant base immediately.
- Seed a small set of milestone templates; add admin/debug preview.

## Documentation Impact
- Update `docs/db-schema.sql` and `docs/db-models.md` to include the new table and `template_id`.
- Update `docs/api-contracts.md` debug endpoint to mention template preview.
