# UI‑EARN‑SANDBOX — Earn screen UI sandbox (Phase 1: Static)

## What
- Create a static UI sandbox for the new Earn screen (formerly Offers) under `web/public/dev/ui/earn/`.
- Implement a single HTML page with a separate CSS file to iterate on layout and visuals quickly.
- Respect width constraints: min 320px, max 420px, centered.
- Include: tabs (Available/Completed), vertical list of cards (virtual list placeholder), and a simple bottom nav stub.
- Card content follows the updated wireframe `docs/UI-mocks-wireframes/wireframes/offers.md`:
  - Line 1: rewardPayload summary with icons (placeholder)
  - Line 2: `taskId` shortened to 15 symbols
  - CTA: "Go get it" with 🚀

## Why
- Fast iteration in pure HTML/CSS reduces friction before committing to React components (Phase 2).
- Align the UI with backend semantics of `/api/v1/tasks` so the visual hierarchy survives the port to React.
- Keep changes isolated from the production app while we converge on spacing, typography, and density.

## Scope (Phase 1 only)
- Static layout, tabs switching via minimal JS is allowed.
- No network calls; use hardcoded examples reflecting the real API shape (coins, coin_multiplier).
- No accessibility polish beyond basic tab focus and roles; deeper A11y is Phase 2.

## Out of scope
- React components, state management, API wiring, timers/TTL logic, modals.


