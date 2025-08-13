# UI-WALLET — Implementation Plan

## Architectural analysis
- Keep Wallet UI entirely in `web/src/app/page.tsx` (in-place). Reuse bottom nav for navigation.
- Use existing counters via GET `/api/v1/counters` to populate Coins and Tickets. No backend changes.
- Persist a demo public address in `sessionStorage`; reflect in UI; no secret keys collected.

## Task list
1. Add `activeSection === 'wallet'` rendering block with components:
   - `WalletHeader` (title + info note)
   - `ConnectWallet` (connect/disconnect, input validation, sessionStorage persistence)
   - `BalancesList` (TON/USDT placeholders, Coins/Tickets from counters)
   - `WalletTabs` (Withdrawals | Activity | Airdrop with empty states)
2. Wire `walletAddress` state + sessionStorage hydration on mount, clear on disconnect.
3. Ensure minimal a11y (focusable CTAs, labelled inputs) and mobile responsiveness.
4. Keep debug/admin panels intact and below Wallet content.
5. Manual QA according to the checklist.

## Documentation impact
- `docs/app-overview.md`: add Wallet shell description and v1 limitations.
- `docs/UI-mocks-wireframes/wireframes/wallet.md`: confirm alignment and note disabled actions.
- Update `CHANGELOG.md` upon completion.

## Rollout
- UI-only; ship behind no flags. Future integration work (real wallet flows) will be separate tickets.
