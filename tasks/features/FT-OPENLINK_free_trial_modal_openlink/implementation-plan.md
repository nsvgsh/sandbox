## Architectural Analysis
- Root cause: iOS Telegram WKWebView blocks `window.open` after awaiting network; the CTA fetch breaks the user gesture chain. Telegram's `openLink` API is the supported bridge to open external links from Mini Apps.
- Constraint: Preserve existing JSON prefetch (`?format=json`) and fall back to 302 if needed. Maintain non-claimable modal semantics, logging, and host restriction.

## Task List
1) Client: In `page.tsx`, within Free Trial modal `onOpen` after JSON fetch, prefer `Telegram.WebApp.openLink(url, { try_instant_view: false })` if available; else `window.open`.
2) UX: Optional loading state on CTA during fetch; preserve focus-return behavior and close button.
3) Docs: Update `docs/app-overview.md` to mention `openLink` usage; clarify `{ try_instant_view: false }`.
4) CHANGELOG: Add entry.

## Documentation Impact
- Document Telegram openLink usage and why it’s required on iOS.
- No server/API changes required.


