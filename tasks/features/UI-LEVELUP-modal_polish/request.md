# UI-LEVELUP-modal_polish — Align Level Up Modal to UI standards

## WHAT
Polish and standardize the Level Up modal to match current app UI conventions, introduce a resilient 3-track vertical grid layout (50/30/20), and improve reusability and accessibility.

## WHY
- Current modal diverges from established patterns (420px container cap, tokens, border-image patterns, typography).
- Fixed heights, inline styles, and bespoke reward visuals increase maintenance cost and visual inconsistency.
- A reusable reward visual and standardized modal layout improve delivery speed for future features and ensure UX consistency.

## SCOPE
- Constrain modal width to the canonical 420px cap; apply safe-area paddings.
- Grid layout with three vertical tracks (50/30/20):
  1) Header + shield + "LEVEL UP!"
  2) Rewards block (scrollable if overflow)
  3) CTAs block (minimum touch-safe height)
- Tokenized colors and standardized typography; remove inline label styles; dedupe font-face.
- Replace bespoke reward visuals with reusable `RewardPill` using border-image pattern (CTA/Tile style).
- A11y improvements: focus trap, initial focus, Esc/overlay close, prevent background scroll.
- Asset path/case normalization.

## NON-GOALS
- Broad refactor into a general-purpose modal system for the entire app (tracked separately if needed).


