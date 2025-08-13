# UI-OFFERS — Task claim success modal (request)

## What
Show a popup window after a task claim succeeds. The modal contains:
- Header: "congratulations!"
- Main text: `reward: task_reward: {TASK_REWARD_LIST}` where the list is formatted from the task's `rewardPayload` (coins, tickets, coin_multiplier).

## Why
- Immediate, clear feedback for users; acknowledges the grant and makes the reward obvious.
- Aligns with Offers UX expectations and reduces ambiguity after claim.

## Scope
- In: In-place modal in `web/src/app/page.tsx` shown on successful `POST /api/v1/tasks/{taskId}/claim`.
- Use the task's existing `rewardPayload` from the in-memory tasks list to render the list (no backend changes).
- Close action dismisses the modal; no state mutation beyond what's already performed on claim.

## Acceptance (high-level)
- After tapping Claim on an available task and receiving 200 OK, a modal appears with the specified header/text, displaying the task's reward items.
- Dismissal closes the modal; tasks/counters refresh remain as implemented; no regressions.
