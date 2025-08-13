# UI-OFFERS — Offers screen scaffold (request)

## What
Implement the Offers screen inside the existing `web/src/app/page.tsx` (in-place, no routing changes), following `docs/UI-mocks-wireframes/wireframes/offers.md`.

Key elements:
- Tabs: AVAILABLE (active), COMPLETED, EXPIRED (local-only for ad-unlock expiry)
- Offer cards: banner placeholder, reward summary (coins, tickets, coin_multiplier)
- Actions per card:
  - Watch Ad → intent-coupled `/api/v1/ad/log` with `intent='task:<taskId>'`
  - Claim → POST `/api/v1/tasks/{taskId}/claim` (within TTL)
- Countdown: advisory, based on `ad_ttl_seconds` from config
- Persistence: per-task ad unlocks stored in `sessionStorage` and mirrored in component state

## Why
- Align local UI with product flow for tasks/offers and enable reliable manual testing.
- Reduce confusion: per-task ad intent unlocks a single claim within a short window.
- Prepare a stable base for future enrichment (media, copy, validity windows) without delaying delivery.

## Scope
- In: Tabs, cards, CTA logic (watch ad → claim), TTL countdown, unlock persistence, empty/loading/error states.
- Out: Routing changes, external SDKs, real offer expiry windows, media storage integration, analytics.

## Acceptance (high-level)
- AVAILABLE tab lists available tasks. Tapping Watch Ad unlocks only that task; Claim is enabled with countdown and succeeds within TTL.
- COMPLETED tab lists claimed tasks.
- EXPIRED shows items whose ad unlock expired (local indicator) until next refresh.
- Errors are shown clearly (e.g., AD_REQUIRED); no regressions in existing Home/Debug sections.
