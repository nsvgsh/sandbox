# UI-BOTTOMNAV-0001 — Bottom navigation color tokens

## Problem
Need to change bottom navigation colors independently from the global `--background`/`--foreground` without impacting other components.

## Root Cause
`BottomNav` uses `background: var(--background)` from the global token which is shared by multiple components. Changing it globally causes unintended side effects.

## Proposed Fix
- Introduce `--bottomnav-background` and `--bottomnav-foreground` CSS variables in `:root`.
- Default them to the existing solid tokens to maintain current appearance.
- Update `BottomNav` styles to use the new tokens for `background` and `color`.
- This enables easy theme adjustments for the bottom bar without regressions elsewhere.
