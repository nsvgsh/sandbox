# Implementation Plan — INGEST-SOFT

## Architectural Analysis
- Validation should not block happy-path in local; warnings suffice.

## Task List
- Add `ingest` config JSON with `max_taps_per_batch` and `clamp_soft`.
- `/api/v1/ingest/taps`: load config, warn on over-limit taps; keep checksum flowing to SQL.

## Documentation Impact
- Update `docs/api-contracts.md` to document soft-mode behavior and headers/warnings.
