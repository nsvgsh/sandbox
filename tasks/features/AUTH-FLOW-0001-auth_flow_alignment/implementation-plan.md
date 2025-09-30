# Implementation Plan — AUTH-FLOW-0001

## Architectural Analysis
- Client currently: probes allowlist inside Telegram and shows Dev Choice UI for allowlisted users, but the "Telegram Login" option is a no‑op; outside Telegram shows an "Open in Telegram" CTA rather than the desired access‑denied message; error UX for `/auth/tg` is console‑only.
- Server currently: `/auth/dev/allowlist` validates `initDataRaw` and returns `{ devEligible }` but not `tgUserId`; `/auth/tg` validates `initDataRaw`, upserts mapping and user, and sets `dev_session` cookie.
- Attribution/session: `x-startapp` forwarded by client to `session/start` and `session/claim`; server parses, persists, and attempts S2S postback. Keep unchanged.

## Task List
1) Server — Allowlist response
- Return `tgUserId` alongside `devEligible` when validation succeeds.
- Align debug headers shape with `/auth/tg` (optional).

2) Client — Inside Telegram Dev Choice
- Wire "Telegram Login" to call `/api/v1/auth/tg` using `initDataRaw` from `Telegram.WebApp.initData`.
- Disable buttons during in‑flight; on success, proceed to session handshake.

3) Client — Dev Login strict binding
- After allowlist success, store `tgUserId` and include `x-telegram-user-id` in `/auth/dev` headers.
- If `tgUserId` missing and `ENABLE_RANDOM_DEV_USER=0`, surface a clear error.

4) Client — Outside Telegram behavior
- Replace CTA with "Outside Telegram. Access denied." message.
- Optionally gate the CTA behind an environment flag for non‑prod convenience.

5) Client — Error UX for `/auth/tg`
- On non‑200, show visible "Login error" with retry; optionally show dev details from `x-debug-*` headers.

6) QA & Observability
- Emit a shared `x-client-corr` across probe/auth and log `x-debug-corr` on errors.
- Test matrices: inside TG (dev allowlisted and non‑dev); outside TG with gates on/off; attribution on start/claim.

## Documentation Impact
- Update `docs/telegram-integration.md` to reflect allowlist payload now includes `tgUserId` and the outside‑Telegram copy.
- Add troubleshooting entry for "Login error" and retry guidance.

## Rollout & Risk
- Low blast radius; scope limited to auth endpoints and initial gate UI.
- Monitor cookie/session reliability on Telegram surfaces; consider a token fallback in a follow‑up if issues appear.
