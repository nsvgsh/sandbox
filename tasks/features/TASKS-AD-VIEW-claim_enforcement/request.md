# TASKS-AD-VIEW — Enforce ad-view before task claim

## WHAT
Require a recent `ad_completed` for task claim. Keep tasks ad-view by default.

## WHY
- Align tasks with monetisation model; ensure reward is gated by ad view

## ACCEPTANCE
- `/api/v1/tasks/{id}/claim` returns `AD_REQUIRED` if no recent ad; on success, counters change and progress=claimed.
- Idempotent claim logic; returns `ALREADY_CLAIMED` on repeats.
