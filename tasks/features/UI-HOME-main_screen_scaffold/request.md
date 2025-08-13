# UI-HOME — Main screen scaffold (request)

## What
Scaffold the Home/Game main screen UI inside the existing `web/src/app/page.tsx`, following `docs/UI-mocks-wireframes/wireframes/home-game.md`. Keep it as an in-place evolution (no new routes) and reuse existing state and API calls.

Key elements to surface:
- Header counters: Coins, Tickets, Level (compact boxes as in the wireframe).
- Avatar/nickname row (placeholder avatar, simple nickname until real profile is available).
- Tap Area: prominent tappable area wired to the existing `tap()` action, displaying current counters/next threshold nearby.
- Bottom navigation bar (Home active; Offers/Wallet placeholders only, not interactive in this ticket).

## Why
- Align local developer UI with the product’s Home/Game experience to validate UX early.
- Keep delivery speed high by evolving the current screen in-place while preserving existing working flows (auth, session, taps).
- Provide a stable scaffold for subsequent visual polish and feature screens.

## Scope
- In: Layout structure, basic styles, wiring to existing counters and `tap()`; bottom nav (non-functional tabs).
- Out: Offers and Wallet screens, advanced animations, Telegram SDK integration, design system extraction.

## Acceptance (high-level)
- After dev login and session start, the page renders the main scaffolded screen:
  - Three top boxes show Coins, Tickets, and Level.
  - Avatar/nickname row visible.
  - A big Tap Area triggers `/api/v1/ingest/taps` and updates counters.
  - Bottom navigation renders with Home highlighted; Offers/Wallet are placeholders.
- No regressions to existing debug/admin capabilities lower on the page.
