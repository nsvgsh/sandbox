# WEB-COOKIES-0001 — Telegram Web third‑party cookie issue

## Problem
In Telegram Web (browser, embedded iframe), POST /api/v1/session/start returns 401 Unauthorized despite successful dev auth (200, Set-Cookie returned).

## Root Cause
Session routes rely on an httpOnly `dev_session` cookie. The cookie was set with `SameSite=Lax; Secure=false`, which is blocked/not sent in third‑party iframe contexts under modern browser 3PC policies. Admin debug endpoints worked because they authorize via headers and do not require cookies.

## Proposed Fix
1. Change dev auth cookie attributes to cross‑site compatible: `SameSite=None; Secure` (consider `Partitioned` if needed later).
2. Add a guarded dev header fallback to session endpoints (`/api/v1/session/start`, `/api/v1/session/claim`): if cookie is missing, accept when `x-dev-token == DEV_TOKEN` and `x-user-id` is present. This preserves dev flows even with aggressive 3PC blocking.

## Acceptance Criteria
- Telegram Web can start/claim a session without 401.
- Cookie shows `SameSite=None; Secure` in responses.
- Header fallback works only when `DEV_TOKEN` matches.


