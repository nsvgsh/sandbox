# Implementation Plan — UI-USERNAME-0001

## Architectural Analysis
- The app already loads the Telegram WebApp script and detects valid `initData` to set `insideTelegram` on the main page.
- Username and names are available client-side via `window.Telegram.WebApp.initDataUnsafe.user` when inside Telegram.
- We can derive a display name purely on the client with zero server calls and minimal blast radius.

## Task List
1. UI — Add `displayName` state in `web/src/app/page.tsx` with default `"Player"`.
2. UI — Implement `deriveDisplayNameFromTelegram()` reading `initDataUnsafe.user` and applying the rule: `username` (without `@`) → `first_name + last_name` → `"Player"`; trim and cap length to 24 chars.
3. UI — Refactor `AvatarRow` to accept `label` prop; render `label` instead of hardcoded text.
4. UI — When `insideTelegram` is true after mount, compute and set the display name; keep SSR default to avoid hydration mismatch.
5. Telemetry — Console-debug event `client_profile_displayname_set` with origin: `username|fullname|fallback`.
6. Docs — Update `docs/app-overview.md` and `docs/telegram-integration.md` to document the client-only behavior and fallbacks.
7. Changelog — Append one line describing the feature.

## Documentation Impact
- `docs/app-overview.md`: Add note about main-screen display name derived from Telegram context, only inside Telegram.
- `docs/telegram-integration.md`: Mention use of `initDataUnsafe.user` for display name; no server dependency.
- `CHANGELOG.md`: One line under features.

## Edge Cases & Constraints
- Outside Telegram or absent `initData`: show `"Player"`.
- Missing `username`: use `first_name + last_name` (trimmed); if still empty → `"Player"`.
- RTL/Unicode: rely on default rendering; no bidi manipulation.
- Security: display-only; no auth decisions; never inject HTML.
- Performance: zero extra network calls; computed once after mount.
