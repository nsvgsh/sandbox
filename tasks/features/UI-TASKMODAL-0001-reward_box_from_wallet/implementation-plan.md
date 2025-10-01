# Implementation Plan — UI-TASKMODAL-0001

## Architectural Analysis
- The existing task completion modal (`TaskClaimModal`) is inline within `web/src/app/page.tsx` and uses plain text to display rewards.
- Wallet UI already defines `AssetRow` with established visuals for asset-like lines and supports a `readonly` prop for non-interactive rows.
- Free Trial modal provides the desired "Back to TAP" button styling via `Button` with `base.ctaButton` and label span `base.actionLabel`.
- A quick, low-risk composition can be done inline without adding new shared components.

## Task List
1. Map `rewardPayload` to a list of display items (coins, tickets, optional coin_multiplier) with iconSrc/iconAlt/label; set `readonly`.
2. Replace the text reward line in `TaskClaimModal` with a reward box: `<ul>` with `AssetRow` entries.
3. Add a full-width "Back to TAP" button at the bottom of the reward box, using the same styling as `FreeTrialLevelUpModal` (`Button` + `base.ctaButton` + `base.actionLabel`).
4. Make the modal card a flex column so height naturally depends on reward box + paddings; avoid fixed height.
5. Verify accessibility: dialog roles, close controls, list semantics.
6. Update docs and changelog.

## Documentation Impact
- `docs/app-overview.md`: Note that the Earn completion modal shows a wallet-styled reward list.
- `CHANGELOG.md`: Add a feature line.

## Edge Cases & Constraints
- Missing fields in `rewardPayload`: display only present rewards.
- Large numbers: format with thin spaces (optional) or simple locale string.
- Extremely long lists: rely on overlay vertical scrolling if content exceeds viewport; primary case remains short lists.
