# Implementation Plan — TASKS-AD-VIEW

## Architectural Analysis
- Use shared ad TTL config; no provider callbacks in local.

## Task List
- `/api/v1/tasks/{id}/claim`: check for recent `ad_events` (status=completed) before applying reward; return `AD_REQUIRED` if missing.
- Keep claim idempotent via underlying reward event logic; seed example tasks.

## Documentation Impact
- Update `docs/api-contracts.md` for task claim error codes and ad requirement.
