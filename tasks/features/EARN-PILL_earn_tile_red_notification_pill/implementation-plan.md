## Architectural Analysis
- Use existing `/api/v1/tasks` client logic to derive `hasAvailable`. No backend changes.
- Extend `BottomNavShadow` to render a `div.notifPill` inside the EARN button and toggle visibility based on a prop.
- Style the pill with percentage sizing/positioning so it scales with the button; add a gentle pulse animation.

## Task List
1) BottomNavShadow: add `earnHasAvailable?: boolean`; mount/unmount or toggle a `div.notifPill` under EARN button.
2) bottomnav.css: add `.notifPill` styles and `@keyframes notifPulse`; position top-right with negative offsets; wrap pulse in reduced-motion guard.
3) page.tsx: compute `hasAvailable` from tasks and pass to `BottomNavShadow`.
4) CHANGELOG: add entry.

## Documentation Impact
- None; behavior is straightforward. Add to changelog only.


