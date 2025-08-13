# UI-LEVELUP — Level-up modal with bonus reveal and claim options (request)

## What
Move the level-up UX into a modal popup on the main screen. The modal reveals the base reward payload and provides clear options:
- Claim (base already granted at level-up)
- X2 bonus (watch ad → claim x2 within TTL with countdown)

It reuses current endpoints/states and works entirely in-place in `web/src/app/page.tsx`.

## Why
- Match product expectations for a focused level-up experience.
- Reduce accidental taps by isolating the decision in a modal.
- Clarify incremental x2 policy; make countdown visible and intuitive.

## Scope
- In: Modal overlay (a11y, focus trap basics), reveal from available data, ad start → confirm flow, countdown, error/expiry handling, non-destructive dismissal, minimal persistence.
- Out: External UI libraries, Telegram SDK integration, public reward-reveal endpoint (planned next).

## Acceptance (high-level)
- On level-up, a modal opens with the reward reveal (when available) and two actions. After starting an ad, it switches to a single “Claim x2 (Xs)” within TTL and reverts on expiry.
- Claim x2 is idempotent and respects server TTL; base-only claim dismisses the modal.
- No regressions to taps/session handling or debug features.
