Title: UI-BOTTOMNAV — Active state and tap feedback

WHAT & WHY
- Add a clear “active now” visual state for the current route/tab in the bottom nav.
- Add a lightweight “tap effect” to provide tactile feedback on press.
- Goals: improve UX clarity, avoid layout shift, preserve performance and accessibility.

Scope
- Update `web/src/ui/BottomNav/BottomNavShadow.tsx` to set `aria-current`/`aria-selected` and `data-state="active"` on the active item; toggle `data-pressed` on pointer down/up.
- Update `web/public/ui/bottomnav/bottomnav.css` to style active item (indicator/pill + color emphasis) and fast tap feedback (scale/overlay). Respect `prefers-reduced-motion`.
- No routing changes; selection remains local to the page for now.

Non-Goals
- No new dependency or major redesign; no ripple allocation engine.

Risks
- Press state must never stick; ensure proper cleanup on `pointercancel`/`pointerleave`.
- Safari mobile `:active` inconsistencies – handled via JS `data-pressed`.

Acceptance Criteria
- Active tab is visually emphasized (icon/label and an indicator) with smooth transform-based animation.
- Tap effect appears on press and goes away reliably; focus-visible remains distinct.
- Reduced motion disables scaling and minimizes transitions.

