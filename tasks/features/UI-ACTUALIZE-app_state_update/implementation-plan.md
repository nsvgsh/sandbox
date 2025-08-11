# UI-ACTUALIZE — Implementation Plan

## Architectural analysis (brief)
- Current UI auto-calls ad/log before task claim, not intent-coupled; level bonus is a direct claim button.
- Backend supports: intent on ad/log; task claim requires matching intent; session claim endpoint exists.

## Plan
- Bonus flow
  - Replace direct "Claim x2 bonus" with two steps: "Watch ad for x2" → ad/log with `intent='level_bonus'` → show "Confirm" to play success and finalize.
- Task flow
  - For each available task, show "Watch ad"; after ad/log with `intent='task:<taskId>'`, enable that task’s "Claim" button.
  - On claim failure with AD_REQUIRED, show a small hint to watch ad again.
- Session resume
  - On load, attempt session claim with stored ids; on mismatch, auto-start a new session.
- UX feedback
  - Inline status labels: locked/available/claimed; simple toasts for errors.

## Tasks
1. Add local state: `adUnlocks` map keyed by `level_bonus` and `task:<id>`; TTL in memory.
2. Bonus flow UI: new "Watch ad" triggers ad/log with intent; set unlock; show confirm button.
3. Task flow UI: per task, watch ad → set unlock; enable claim; call claim; clear unlock on success.
4. Session resume: store session ids; on mount call session.claim; fallback to start.
5. Error handling: show AD_REQUIRED; clear expired unlocks.
6. Docs: update README UI section; CHANGELOG.

## Docs impact
- `docs/feature-catalog.md`: reference UI alignment.
- `README.md`: brief local testing notes.

## Rollout
- UI-only; behind no flags; keep simple styles.
