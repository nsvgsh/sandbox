# Implementation Plan — UI‑EARN‑SANDBOX (Phase 1: Static)

## Architectural analysis
- Static sandbox lives at `web/public/dev/ui/earn/` to match existing dev assets patterns.
- Visuals driven by `docs/UI-mocks-wireframes/wireframes/offers.md` (updated):
  - Tabs: Available (active) | Completed.
  - Card rows: rewardPayload summary + truncated taskId (15 chars) with icons; CTA "Go get it" (🚀).
  - Virtual list placeholder (non-functional in Phase 1).
- Backend `/api/v1/tasks` shape (for realistic placeholders):
  {
    "definitions": [
      {"taskId":"…","unlockLevel":1,"kind":"in_app","rewardPayload":{"coins":100},"verification":"none","state":"available"},
      {"taskId":"…","unlockLevel":2,"kind":"in_app","rewardPayload":{"coin_multiplier":0.1},"verification":"none","state":"locked"}
    ],
    "progress":[],
    "userLevel":1
  }
  - Phase 1 renders hardcoded examples mirroring these fields.
- Width constraints: min 320px, max 420px; centered; safe-area aware.
- Reuse styles approach seen in `web/public/dev/ui/bottomnav/` where helpful; no React/CSS Modules yet.

## Task list
1. Create static container with min/max width and page scaffolding.
2. Implement tabs bar (visual only, simple JS toggle for content panels).
3. Build offer card block with: reward summary line, truncated taskId (15), CTA line.
4. Add vertical list of 2–3 sample cards for Available; 1 sample for Completed.
5. Add bottom nav stub consistent with wireframe (non-functional, simple layout).
6. Add `styles.css` with component-scoped classes; no global leakage.
7. Ensure clamp/ellipsis for long fields; prevent horizontal scroll.
8. Validate at widths: 320/360/390/414/420.

## Documentation impact (to update after completion)
- `docs/app-overview.md`: mention Earn static sandbox location.
- `docs/UI-mocks-wireframes/wireframes/offers.md`: confirm visual parity.
- `CHANGELOG.md`: add a line for Phase 1 deliverable.

## Risks & mitigations
- Drift from backend semantics → mirror field names exactly in placeholders.
- Overflow on small widths → line-clamp and ellipsis; wrap long words.
- Safe-area overlap → bottom padding and `env(safe-area-inset-*)` usage.

## Acceptance criteria
- Page centers within min 320 / max 420, no horizontal scroll.
- Tabs visually switch content; Available default.
- Cards show rewardPayload summary + 15-char taskId + CTA line.
- Separate CSS file; no inline layout except minimal variables.
