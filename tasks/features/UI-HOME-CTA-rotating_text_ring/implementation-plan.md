# UI-HOME-CTA — Implementation Plan

## Architectural analysis
- Placement: ring UI colocated with Home screen tap area; overlayed above the EmojiClicker using an absolutely positioned wrapper within the same vertical stack. No routing changes.
- Technique: SVG textPath around a circular path. Rotation via CSS transform animation (GPU-friendly). Visibility via opacity transitions based on tap activity.
- Sizing: ring size derived from `clickerSize` (existing ergonomic sizing). Gap scales with button size (8–18px). Font uses Lilita One and clamp-like sizing relative to `clickerSize` for 320–420px containers.
- Accessibility: Decorative only (`aria-hidden`), `pointer-events: none`. Reduced motion respected via `prefers-reduced-motion` media query.
- State: Local idle/tap activity state and timer on the Home screen, independent of backend.

## Task list
1. Create `RotatingTextRing` component (SVG textPath, spinning wrapper, CSS effects and tokens).
2. Integrate into Home: wrap `EmojiClicker` with a positioned container, render ring centered; ensure stacking order below particles.
3. Add tap-activity idle timer: hide ring on tap, show after ~1000ms inactivity.
4. Respect reduced motion (disable spin) and mark ring as decorative.
5. Align typography and effects with existing styles (Lilita One, stroke, drop-shadow; container width conventions held by `ScreenContainer`).
6. Update `docs/app-overview.md` with a concise note about the home CTA ring and reduced-motion behavior.
7. Append a new line in `CHANGELOG.md` for the feature.

## Documentation impact
- `docs/app-overview.md`: Add a brief description of the rotating CTA ring, visibility logic, and reduced-motion fallback.

## Rollout
- UI-only; no backend changes. Safe to ship alongside current home screen.
