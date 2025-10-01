# Feature Request — UI-USERNAME-0001 — Display username from Telegram

## WHAT
Replace the static "Player" label on the main screen header with the user's Telegram display name derived on the client from Telegram Mini Apps context (`window.Telegram.WebApp`).

## WHY
- Personalize the main screen to improve user recognition and engagement.
- Avoid new backend contracts and deliver quickly by leveraging already available Telegram context.
- Scope intentionally limited to inside Telegram; outside Telegram the label remains "Player".

## Scope
- Only UI changes in `web/src/app/page.tsx` (no backend changes).
- Derive display name from Telegram `initDataUnsafe.user` if available: prefer `username` (without leading `@`), else `first_name + last_name`, else fallback to `"Player"`.
- No persistence beyond in-memory state; no API calls.

## Non-Goals
- No server-side profile endpoint.
- No cross-session persistence.
- No changes to auth/session mechanics.

## Acceptance Criteria
- Inside Telegram (valid initData), the label shows `username` if present (no leading `@`), otherwise human name; otherwise shows `"Player"`.
- Outside Telegram or missing `initData`, label remains `"Player"`.
- No layout regressions; no hydration warnings; no console errors related to this feature.
