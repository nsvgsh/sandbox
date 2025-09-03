# UI-GRADIENT-0001 — Page background gradient

## Problem
The app background should be a vertical gradient (bottom → top) from #275c99 to #162e54 to match the game palette.

## Root Cause
The current `--theme-background` token is a solid color and is also aliased to `--background`. Some components use `var(--background)` in contexts that require a solid color (e.g., `color`), so directly changing the token to a gradient would cause regressions.

## Proposed Fix
- Introduce a dedicated gradient token and apply it only to the `body` background.
- Keep `--theme-background` as a solid color for components and alias `--background` to that solid token.
- Implement: add `--theme-background-gradient: linear-gradient(to top, #275c99 0%, #162e54 100%);`, set `body { background: var(--theme-background-gradient); }`, and keep `--background` mapped to a solid color.
