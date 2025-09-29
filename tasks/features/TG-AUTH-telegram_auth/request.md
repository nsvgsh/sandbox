# TG-AUTH — Telegram user authentication

## WHAT
Implement Telegram Mini Apps authentication for users via `/api/v1/auth/tg`, preserving existing dev login for an allowlisted set of developers, and adding a dev affordance to trigger Dev Login outside Telegram when explicitly enabled.

## WHY
- Current app relies solely on a dev cookie and lacks Telegram login. Users cannot enter the app via standard Mini Apps flow.
- We must preserve existing dev login for specific users and also allow those users to login via Telegram.
- We need a controlled, gated dev path to reach Dev Login when launching outside Telegram for local development.

## Constraints
- Follow docs: `docs/telegram-auth/Full-Telegram-Mini-Apps-docs.md` for initData validation; `docs/api-contracts.md` for routes.
- Preserve current gameplay/session endpoints unchanged (cookie-based) for minimal blast radius.
- Add a dev-only affordance outside Telegram, gated by BOTH an env flag and a URL param.

## Acceptance
- Inside Telegram: non-devs auto authenticate and land on main screen.
- Inside Telegram: allowlisted devs get a choice (Dev Login • Telegram Login) and both work.
- Outside Telegram: “Open in Telegram” is shown; if BOTH gates are enabled, a dev affordance opens the same choice UI.
- Session resume/start and `x-startapp` propagation remain intact.
