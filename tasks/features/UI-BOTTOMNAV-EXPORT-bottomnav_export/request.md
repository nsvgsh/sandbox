Title: UI-BOTTOMNAV-EXPORT — Export sandbox bottom navigation without CSS bleed

What & Why
- Replace the current in-place bottom navigation with the finalized sandbox bottomnav (exact visuals and DOM structure) while eliminating global CSS bleed.
- Preserve in-place navigation (no new routes). Maintain existing click behavior to switch sections.
- Defer gradient rollout; focus on a clean, isolated integration.

Scope
- Copy sandbox CSS and assets into public `ui/bottomnav/` as-is.
- Implement bottomnav as a Shadow DOM component so class selectors do not leak globally.
- Wire host-level CSS tokens (e.g., `--bottomnav-height`) for layout and theming.
- Remove the legacy dev sandbox folder after integration.

Non-Goals
- A11y improvements beyond current semantics.
- Background/page gradient and `.bottomNav::before` overlay (postponed).

Acceptance Criteria
- Visual parity with sandbox (buttons, labels, sizing).
- No global selector collisions; no regressions elsewhere.
- Page content does not overlap the fixed nav; safe-area respected.

