# UI‑EARN‑PHASE2 — React port of Earn sandbox into production (BottomNav “Earn” tab)

## What
- Port the static Earn sandbox from `web/public/dev/ui/earn/` into the production Next.js app so the “Earn” tab in the bottom navigation renders the same UI.
- Build reusable React components with CSS Modules that mirror the current sandbox visuals (tiles grid, badge overlay, CTA, icon), then integrate them under the existing tab key currently called `offers` in code.
- Keep width constraints (min 320px, max 420px), safe‑area padding, and no horizontal scroll.

## Why
- Unify design between sandbox and app runtime; remove divergence with the placeholder Offers UI.
- Establish reusable UI primitives for future iteration (loading/skeletons, empty state, data mapping).
- Enable quick dev validation through the existing BottomNav tab without exposing a separate prototype in prod UX.

## Scope (Phase 2)
- Components under `web/src/ui/earn/*` with separate `*.module.css`.
- Integrate into the existing main page section controlled by `activeSection === 'offers'` (labelled “EARN” in BottomNav visuals).
- Optional dev route `/dev/earn` for isolated preview (non‑indexed) using mock data.
- Asset handling: copy required sandbox images into a stable `web/public/ui/earn/` path and update references.

## Acknowledgement of current sandbox state
- The sandbox at `web/public/dev/ui/earn/` is a two‑column tiles layout with:
  - Badge frame (`CardFrame01_Icon.png`) + numeric overlay.
  - Tile background from `Button03_Blue.png` and CTA styled via `Button01_Green.Png` border image.
  - Centered icon (e.g., `Icon_Chest.Png` / `Icon_Target.Png`).
  - Minimal bottom nav stub for context.
- This differs from the earlier “Offers” wireframe (vertical list). Phase 2 targets the sandbox design as‑is.

## Out of scope
- Virtualized lists, detailed task modals, wallet flows, ad/claim policy changes, backend API changes.

## Success criteria
- “Earn” tab renders the tiles grid matching sandbox visuals and constraints.
- Styles are isolated via CSS Modules; assets load from `web/public/ui/earn/`.
- No regression to Home/Wallet; BottomNav continues to function.
