## Request: Free Trial modal JSON prefetch for partner redirect

### WHAT
- Extend `GET /api/v1/offer/free-trial/level/{level}/modal-redirect` with `?format=json` to return `{ url }` instead of issuing a 302, while preserving current validation, host safety, and ad-event logging.
- Update the Level-up Free Trial modal CTA handler to prefetch `{ url }` from the app tab and then open the partner URL in a new tab.

### WHY
- In Telegram webview, opening the CTA in a new tab moves to an external browser that often does not share cookies with the webview. The redirect endpoint then sees no `dev_session` and returns 401, blocking the flow.
- Prefetching in the authenticated app tab avoids cookie transfer issues and maintains logging, safety checks, and UX.


