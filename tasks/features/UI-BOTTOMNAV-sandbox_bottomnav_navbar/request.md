# UI-BOTTOMNAV — BottomNav sandbox (single HTML + CSS)

## WHAT
Create a single-file bottom navigation sandbox under `web/public/dev/ui/bottomnav` using one HTML and one CSS file. Render three buttons via a `<template>` with a minimal inline module script to clone and parameterize items.

## WHY
We have three finalized button sandboxes but no consolidated bottom navigation to iterate layout/spacing/visuals quickly. A single HTML + CSS keeps sandbox friction low and ports 1:1 to a future React TSX component.

## SCOPE
- Add `bottomnav.html` and `bottomnav.css` only (no external JS).
- Use assets already in `web/public/dev/ui/bottomnav/assets/`.
- Keep all visual tuning via CSS vars.

## OUT OF SCOPE
- React integration, routing, click handlers beyond demo.
- Additional assets or image generation.


