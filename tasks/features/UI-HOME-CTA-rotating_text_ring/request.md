# UI-HOME-CTA — Rotating circular CTA text around tap button (request)

## What
Add an animated circular text ring saying "START TAP TO EARN REAL CASH" around the main tap button on the Home screen. The text rotates continuously when idle, fades out on tap activity to declutter gameplay, and fades back in after a short inactivity period.

## Why
- Reinforce the core value proposition with a persistent CTA in the primary interaction zone.
- Increase engagement and comprehension for first-time users without obstructing active tapping.
- Keep UI dynamic and polished while respecting performance and accessibility (reduced motion).

## Scope
- In: Visual ring implementation using SVG textPath around the existing EmojiClicker, rotation animation, idle/tap visibility behavior, reduced-motion fallback, styling aligned with existing typography and container constraints (320–420px width).
- Out: Localization, dynamic copy changes, analytics events for visibility, alternate shapes.

## Acceptance
- The text ring is centered on the tap button, with a consistent scalable gap from the button edge.
- Ring rotates smoothly when idle; fades out immediately on tap; fades back in after ~1s of inactivity.
- Typography matches app conventions (Lilita One, stroke/shadow), and scales for 320–420px containers.
- Reduced motion preference disables rotation while preserving idle visibility behavior.
- No interference with tapping; no regressions to counters, taps batching, or modals.
