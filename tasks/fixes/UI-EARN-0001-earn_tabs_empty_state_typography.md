# UI-EARN-0001 — Earn tabs and EmptyState typography

## Problem
Earn screen tab buttons and the empty state do not match the requested typography: Lilita One with specific letter spacing, stroke/shadow, and colors.

## Root Cause
Default component styles remained from the initial scaffold (`EarnGrid.module.css`, `EmptyState.module.css`) and were not updated to the finalized visual spec.

## Proposed Fix
- Update `web/src/ui/earn/EarnGrid/EarnGrid.module.css` `.tabBtn` to use:
  - `font-family: 'Lilita One'`
  - `letter-spacing: -0.025em`
  - `color: #ffffff`
  - `-webkit-text-stroke: 0.018em #000000`
  - `filter: drop-shadow(0 0.07em 0 #000000)`
- Update `web/src/ui/earn/EmptyState/EmptyState.module.css` `.root` to use:
  - `font-family: 'Lilita One'`
  - `color: #dadada`
  - `line-height: 1.4`
  - `letter-spacing: -0.025em`

## Validation
- Visual check on `/dev/earn` and main page offers section tabs.
- Confirm no regressions in button interactivity/ARIA roles.

