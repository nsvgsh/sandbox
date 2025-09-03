Implementation Plan — UI-BOTTOMNAV-EXPORT

Architectural Approach
- Use a Shadow DOM wrapper to scope sandbox CSS and DOM, preventing global CSS bleed.
- Keep sandbox CSS and HTML structure 1:1; expose customization through host-level CSS variables.
- Defer gradients; maintain fixed bottom layout and safe-area padding.

Tasks
1) Assets & CSS
   - Create `web/public/ui/bottomnav/assets/` and copy sandbox images.
   - Copy font to `web/public/ui/buttons/assets/LilitaOne-Regular.ttf` to satisfy `@font-face` URL.
   - Place `bottomnav.css` at `web/public/ui/bottomnav/bottomnav.css` unchanged.
   - Remove any `.DS_Store`.

2) Component
   - Create `web/src/ui/BottomNav/BottomNavShadow.tsx`.
   - Attach open shadow root. Inside shadow, inject:
     - `<link rel="stylesheet" href="/ui/bottomnav/bottomnav.css">`
     - Exact sandbox DOM: `.bottomNav` container with three `.imgBtn` children.
   - Props: `active: 'home'|'offers'|'wallet'`, `onSelect: (key) => void`.
   - Implement active styling via host-level vars or `data-active` attribute inside shadow.

3) Integration
   - Replace legacy nav in `web/src/app/page.tsx` with `BottomNavShadow`.
   - Ensure main content uses `padding-bottom: calc(var(--bottomnav-height) + env(safe-area-inset-bottom))`.
   - Set sensible defaults on host (e.g., `--bottomnav-height: 132px`).

4) Cleanup
   - Remove `web/public/dev/ui/bottomnav/`.
   - Verify there are no stale imports.

5) QA
   - Viewports: tall/short; <=480px to validate media query.
   - iOS/Android: safe-area insets, fixed positioning, centering.
   - No global selector bleed: search for `.btnLabel` usage outside the shadow; confirm none.

Documentation Impact
- Add CHANGELOG entries for export and isolation. Note gradient postponed.

Risks / Thin Points
- Relative font URL in `@font-face`: ensure target path exists to avoid edits.
- `env(safe-area-inset-bottom)` inside shadow: validate; if inconsistent, add equivalent padding on host wrapper.

