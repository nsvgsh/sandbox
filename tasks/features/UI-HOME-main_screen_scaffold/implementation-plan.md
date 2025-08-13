# UI-HOME — Implementation Plan

## Architectural analysis (focused)
- We will evolve `web/src/app/page.tsx` in-place, introducing lightweight components (as functions within the file) to avoid routing changes.
- Reuse existing state (`counters`, `tap()`, `session`) and APIs (`/api/v1/ingest/taps`, `/api/v1/counters`).
- Layout follows `docs/UI-mocks-wireframes/wireframes/home-game.md` with minimal inline styles to keep velocity.

## Task list
1. Extract lightweight presentational helpers within `page.tsx`:
   - `HeaderCounters({ counters })` – renders Coins, Tickets, Level boxes.
   - `AvatarRow()` – placeholder avatar + nickname.
   - `TapArea({ onTap })` – large tap area wired to the existing `tap()` function.
   - `BottomNav({ active })` – renders Home (active), Offers, Wallet (placeholders).
2. Integrate components into the top of the page, above debug sections.
3. Ensure counters update after tapping; preserve existing error handling/backoff.
4. Keep all debug/admin sections intact below the scaffolded UI.
5. Light responsive rules so the layout fits narrow mobile widths.

## Documentation impact
- None beyond referencing the wireframe; a short note will be added later under `docs/app-overview.md` after Offers/Wallet land.

## Rollout
- UI-only; no backend changes; ship behind no flags.
