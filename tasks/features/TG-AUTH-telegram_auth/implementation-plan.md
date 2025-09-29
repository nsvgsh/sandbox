# Implementation Plan — TG-AUTH

## Architectural Analysis
- Current codebase authorizes all gameplay endpoints via `dev_session` cookie. Dev login exists at `/api/v1/auth/dev`.
- There is no Telegram auth path implemented. Docs require validating `Telegram.WebApp.initData` and issuing app credentials.
- To minimize blast radius, we will implement `/api/v1/auth/tg` that validates `initDataRaw`, then sets the existing `dev_session` cookie to the mapped `user_id` so all current endpoints continue to work.
- We add a side-effect-free probe `/api/v1/auth/dev/allowlist` to detect whether a validated Telegram user is in `dev_whitelist`.
- Outside-Telegram dev affordance will only be shown when BOTH an env gate (`NEXT_PUBLIC_ENABLE_OUTSIDE_TG_DEV=1`) and a URL param (`?dev=1`) are present.

## Task List
1) DB migrations
- Create `telegram_identities` mapping (tg_user_id → user_id, plus optional profile fields)
- Create `dev_whitelist` (tg_user_id primary key)

2) Server endpoints
- `POST /api/v1/auth/tg`: validate `initDataRaw`, upsert mapping and user, set `dev_session` cookie, return `{ ok: true, user }`.
- `POST /api/v1/auth/dev/allowlist`: validate `initDataRaw`, return `{ devEligible }` from `dev_whitelist` with no side effects.
- Harden `POST /api/v1/auth/dev`: accept `x-telegram-user-id` and require whitelist; bind session to mapped `user_id`; allow random `user_id` only when `ENABLE_RANDOM_DEV_USER=1`.

3) Client (AuthGate)
- Inside Telegram: get `initDataRaw` → probe allowlist → devs get Choice Modal (Dev Login • Telegram Login), non-devs auto call `/auth/tg`, then resume/start session and navigate to main.
- Outside Telegram: show “Open in Telegram” CTA; if BOTH `NEXT_PUBLIC_ENABLE_OUTSIDE_TG_DEV=1` and `?dev=1`, show dev affordance that opens the same Choice Modal.
- Always propagate `x-startapp` to `session/claim|start`.

4) Env & deps
- Add `@telegram-apps/init-data-node` to web.
- Env vars: `TELEGRAM_BOT_TOKEN`, `INITDATA_TTL_SECONDS`, `NEXT_PUBLIC_ENABLE_OUTSIDE_TG_DEV`, optional `ENABLE_RANDOM_DEV_USER`.

## Documentation Impact
- Update `docs/api-contracts.md` with the two new endpoints and request/response examples.
- Update `docs/app-overview.md` and `docs/telegram-integration.md` to describe the implemented flow and outside‑TG dev gating.
- Update `docs/env.example` with the new variables.

## Notes & Edge Cases
- Cookie attributes remain `SameSite=None; Secure` for Telegram Web.
- initData delay on Desktop/macOS → implement short retries before fallback.
- No logging of `initDataRaw` or secrets; only tg_user_id and truncated identifiers.
- Fallback paths: if `/auth/tg` fails, show CTA; if Dev Login 403, show explicit denial.
