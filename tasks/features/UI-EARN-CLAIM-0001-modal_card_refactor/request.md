# Feature Request — UI-EARN-CLAIM-0001 — Reuse shared ModalCard and AssetRow in Earn-claim modal

## WHAT
Unify the task completion modal (Earn claim confirmation) with the main LevelUp modal visuals by extracting a shared `ModalCard` layout and refactoring both the LevelUp modal and the task-claim modal to use it. Render rewards inside the task-claim modal using the existing `AssetRow` component from the Wallet UI.

## WHY
- Consistent visual language across modals improves UX and maintainability.
- Reduce duplicated structure and styles by centralizing the card layout.
- Leverage existing `AssetRow` for clear, compact reward summaries.

## Scope
- Extract `ModalCard` (overlay + card grid + header/rewards/actions slots) under `web/src/ui/Modal/ModalCard.tsx` with styles in `Modal.module.css` (extending existing file) or `ModalCard.module.css` if needed.
- Refactor `LevelUpModal` to consume `ModalCard`.
- Replace local `TaskClaimModal` (in `page.tsx`) with a dedicated `TaskClaimModal` component under `web/src/ui/Modal/TaskClaimModal.tsx` built on `ModalCard` and `AssetRow`.

## Non-Goals
- Changing reward logic or backend APIs.
- Adding new reward types beyond coins/tickets for v1.

## Acceptance Criteria
- LevelUp and Task-claim modals share the same base card, overlay behavior, spacing, and typography.
- Task-claim modal lists rewards via `AssetRow` with correct icons/labels and no actions (readonly rows).
- Backdrop click closes; clicks inside card do not close.
- No regressions in LevelUp modal actions, layout, or responsiveness.
