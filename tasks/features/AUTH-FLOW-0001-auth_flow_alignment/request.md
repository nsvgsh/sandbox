# AUTH-FLOW-0001 — Align client auth flow to desired design

## WHAT
Implement the high‑level login decision flow (client) as specified, closing the gaps between docs and code:
- Inside Telegram: Dev Choice UI provides both working actions (Dev Login • Telegram Login). Non‑devs auto‑authenticate via `/api/v1/auth/tg`.
- Outside Telegram: when dev affordance is not enabled, show "Outside Telegram. Access denied."; when enabled and URL contains `?dev=1`, show a single "Dev login" button.
- Dev allowlist probe returns `tgUserId` so the client can bind Dev Login to a Telegram identity when strict mode is used.
- On `/api/v1/auth/tg` failure, show a visible "Login error" message.
- Preserve `x-startapp` attribution forwarding to `/v1/session/claim|start`.

## WHY
- Ensure product behavior matches the documented flow, reducing confusion and debugging time.
- Improve developer UX by enabling strict Dev Login binding to real Telegram identities.
- Provide clearer messaging outside Telegram to avoid misuse while keeping optional gated dev access.
- Enhance reliability and observability of the auth journey with explicit error UI.

## Acceptance Criteria
- Inside Telegram:
  - Allowlisted: Dev Choice shows; Dev Login works (binds to Telegram identity when provided); Telegram Login calls `/api/v1/auth/tg` and succeeds.
  - Not allowlisted: auto `/api/v1/auth/tg` → session.
  - On `/api/v1/auth/tg` error: visible "Login error" with retry.
- Outside Telegram:
  - If dev affordance disabled: show "Outside Telegram. Access denied." only.
  - If enabled and `?dev=1`: show a single "Dev login" button.
- `x-startapp` is forwarded on both session start and claim.
