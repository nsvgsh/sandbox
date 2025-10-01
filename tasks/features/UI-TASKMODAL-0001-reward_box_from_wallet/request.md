# Feature Request — UI-TASKMODAL-0001 — Task modal reward box reuse

## WHAT
Update the Earn task completion modal to present rewards using the wallet's `AssetRow` layout inside a dynamic "reward box". The modal card should size to the reward box, and a "Back to TAP" button (same as in the Free Trial modal) should be placed at the bottom of the reward box.

## WHY
- Visual consistency with the Wallet UI increases clarity and reduces cognitive load.
- Dynamic height prevents awkward empty space and adapts to variable reward sets.
- Reusing the established "Back to TAP" pattern improves navigation consistency.

## Scope
- Update `TaskClaimModal` rendering inside `web/src/app/page.tsx` to:
  - Compose a reward list using `ui/wallet/components/AssetRow/AssetRow` with `readonly` styling.
  - Add a full-width "Back to TAP" button at the bottom of the reward box using the same styling as `FreeTrialLevelUpModal`.
  - Let the modal card size to content (natural height) without fixed heights.
- No backend/API changes.

## Acceptance Criteria
- After completing a task, the modal shows a list of rewards as rows with icons and labels.
- The card height adapts to the number of rows; no internal scroll for typical payloads.
- A full-width "Back to TAP" button appears under the reward list; clicking it closes the modal.
