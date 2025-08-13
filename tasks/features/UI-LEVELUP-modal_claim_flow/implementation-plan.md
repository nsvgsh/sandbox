# UI-LEVELUP — Implementation Plan

## Architectural analysis
- Keep everything in `web/src/app/page.tsx` (Approach A: in-place evolution). Modal implemented as a local component (overlay + focus trap + scroll lock). No new routes.
- Use existing states/endpoints: `leveledUp`, `startLevelBonus()` → `/api/v1/ad/log`, `claimLevelBonusX2()` → `/api/v1/level/bonus/claim` with `x-idempotency-key`.
- Reward reveal pulls from `debugState.lastLevel.reward_payload` (dev). Plan a small public endpoint later to replace this dependency.

## Task list
1. Modal component skeleton: overlay, container, title, slots for content/actions; focus management and Escape/backdrop close; scroll lock.
2. Integrate with level-up signals: open when `leveledUp` set; close on base-claim or successful x2 claim.
3. Reward reveal: render from `debugState.lastLevel.reward_payload` when available; gracefully handle missing data.
4. Ad start → confirm: wire “Watch ad” to `startLevelBonus()`; show countdown; disable/revert on expiry.
5. Claim x2: call `claimLevelBonusX2()`; handle `TTL_EXPIRED`, `ALREADY_CLAIMED`, and generic errors; update counters; clear modal state.
6. Persistence: store `{ level, impressionId, expiresAt }` in `sessionStorage`; restore confirm state when modal opens for the same level.
7. A11y: `role="dialog"`, `aria-modal`, labeled title, initial focus, trap loop, focus restore.
8. QA: cover happy path, expiry, idempotency, rotation retry, reload persistence, dismissal.

## Documentation impact
- Update `docs/app-overview.md` (level-up UX as modal) and `docs/api-contracts.md` UI notes (ad TTL advisory countdown, idempotency key usage).
- Append `CHANGELOG.md` entries per completed sub-tasks.

## Rollout
- UI-only change; no backend edits. Ship behind no flags. If future public endpoint for reward reveal is added, treat as separate ticket.
