# Implementation Plan — UI‑EARN‑PHASE2 (Approach C: React port to prod)

## Architectural analysis
- Current runtime: `web/src/app/page.tsx` controls sections via `activeSection: 'home' | 'offers' | 'wallet'` and renders a simple placeholder for Offers. Bottom nav uses `BottomNavShadow` with tab key `offers` labeled as “EARN”.
- Sandbox reality: `web/public/dev/ui/earn/` implements a 2‑column tiles UI with badge overlay, CTA nine‑slice, and centered icon. This is the visual source of truth for Phase 2.
- Goal: replicate sandbox visuals as React components (CSS Modules) and mount them when `activeSection === 'offers'`. Keep container min/max width (320/420), safe‑area, and no horizontal scroll.
- Assets: move/copy required images to `web/public/ui/earn/` to avoid coupling to `/dev` path. Update references accordingly.

## Task list
1) Create component structure under `web/src/ui/earn/`:
   - `EarnGrid/EarnGrid.tsx` + `EarnGrid.module.css` (container, grid, width clamps, safe‑area padding)
   - `Tile/Tile.tsx` + `Tile.module.css` (tile background, nine‑slice CTA, icon positioning)
   - `Badge/Badge.tsx` + `Badge.module.css` (frame image + numeric overlay)
   - `EmptyState/EmptyState.tsx` + `EmptyState.module.css` (no items)
   - `Skeletons/TileSkeleton.tsx` + `TileSkeleton.module.css` (loading)
2) Public assets
   - Create `web/public/ui/earn/` and copy: `CardFrame01_Icon.png`, `Button03_Blue.png`, `Button01_Green.Png`, `Icon_Chest.Png`, `Icon_Target.Png` (preserve file names/case).
   - Update component CSS/props to reference `/ui/earn/...` paths.
3) Mount in runtime
   - In `web/src/app/page.tsx`, replace the Offers inline placeholder with `<EarnGrid .../>` and map API `/api/v1/tasks` results to tiles (basic fields only: taskId, rewardPayload).
   - Keep the existing ad unlock + claim handlers (watch/claim) wired to CTA where appropriate; if scope too large, wire CTA to a no‑op with TODO comment removed before merge.
4) State & behavior
   - Provide `props` to `EarnGrid` for: items (available/completed), loading, activeTab, onTabChange, onWatch, onClaim, secondsLeft resolver.
   - Add simple tab header (Available/Completed) above the grid using component‑scoped CSS.
5) Accessibility & constraints
   - Ensure container clamps width [320, 420], centers, respects `env(safe-area-inset-bottom)`.
   - Buttons are keyboard focusable; images use `alt=""` if decorative.
6) Dev route (optional)
   - Add `/dev/earn` page that renders `EarnGrid` with mock data and `noindex` metadata to validate in isolation.
7) Documentation & logs
   - Update `docs/app-overview.md` (Earn UI in production uses React components; sandbox remains for asset iteration only).
   - Add a line to `CHANGELOG.md` after completion.

## Documentation impact
- `docs/app-overview.md`: add a section for Earn (production) and the dev route if created.
- `docs/UI-mocks-wireframes/wireframes/offers.md`: note that production Earn mirrors the sandbox tile design.
- `CHANGELOG.md`: one line for the Phase 2 deliverable.

## Risks & mitigations
- Drift between sandbox and components → copy exact assets and replicate spacing using CSS Modules.
- Asset path/case issues on different OSes → preserve original casing; test paths.
- Safe‑area overlap → add bottom padding equal to nav height + safe‑area inset.

## Acceptance criteria
- When tapping the bottom nav “EARN” (code key `offers`), the tiles grid appears with badges, CTA, and icons matching sandbox.
- No horizontal scroll at any viewport; container respects 320/360/390/414/420 widths.
- Styles isolated (no leakage into other screens).
