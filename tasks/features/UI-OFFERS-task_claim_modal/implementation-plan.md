# UI-OFFERS — Implementation Plan: Task claim success modal

## Architectural analysis
- Keep logic in `web/src/app/page.tsx`. Reuse an in-file modal component pattern similar to LevelUpModal.
- Use the task payload from the current `tasks` state at claim time to format `{TASK_REWARD_LIST}`.
- No backend changes; rely on existing POST `/api/v1/tasks/{taskId}/claim`.

## Task list
1. Add UI state: `claimSuccess`, e.g., `{ taskId, rewardPayload } | null`.
2. On successful claim, set `claimSuccess` before refreshing tasks; or capture payload by lookup from prev state.
3. Implement `TaskClaimModal`:
   - Header: "congratulations!"
   - Main: `reward: task_reward: { ... }` formatted from payload keys.
   - Close button to dismiss (sets `claimSuccess = null`).
4. A11y: `role="dialog"`, `aria-modal`, focus trap/restore; backdrop click/Escape close.
5. QA: Claim path shows modal; dismiss works; no regressions to Offers list.

## Documentation impact
- Minor UI note in Offers docs; update `CHANGELOG.md` upon completion.

## Rollout
- UI-only; ship behind no flags. No server changes.
