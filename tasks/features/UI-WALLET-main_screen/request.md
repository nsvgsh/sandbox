# UI-WALLET — Wallet screen scaffold (request)

## What
Implement the Wallet screen inside the existing `web/src/app/page.tsx` (in-place, no routing changes), following `docs/UI-mocks-wireframes/wireframes/wallet.md`.

Key elements:
- Header: "Wallet (balances)" with an info note that only a public address is stored locally.
- Connect Wallet CTA: demo-only capture of a public address (stored in sessionStorage), with disconnect.
- Balances list:
  - TON 0.000, USDT 0.000 (read-only placeholders; actions disabled)
  - Coins and Tickets from `/api/v1/counters` (read-only)
- Tabs: Withdrawals | Activity | Airdrop — content placeholders with empty states.

## Why
- Align the local UI with the product wireframe for Wallet without introducing real custody/chain logic in v1.
- Enable UX validation, copy alignment, and layout stabilization ahead of deeper integrations.

## Scope
- In: In-place UI scaffolding, local address persistence, disabled actions, counters integration, basic a11y and responsiveness.
- Out: Real wallet integrations (TON Connect/Stars), deposits/withdrawals, on-chain activity feeds, backend schema changes.

## Acceptance (high-level)
- Switching to Wallet (via bottom nav) shows header, connect CTA, balances list, and tabs as per wireframe.
- Address connects/disconnects locally; balances render coins/tickets from counters; TON/USDT are placeholders; actions are disabled with a tooltip/note.
- Tabs switch and show stable empty states without layout jumps.
