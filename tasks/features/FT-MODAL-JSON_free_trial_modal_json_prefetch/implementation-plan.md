## Architectural Analysis
- Problem: In Telegram, the Free Trial modal CTA opens a new tab that often lacks the `dev_session` cookie → `/modal-redirect` returns 401.
- Constraint: Keep existing validation (schedule, config), host safety (endsWith himfls.com), and ad-event logging semantics (placement=level_up_modal) unchanged.
- Approach: Add `?format=json` to `GET /api/v1/offer/free-trial/level/{level}/modal-redirect` to return `{ url }` after the same validations + logging. Client calls JSON from authenticated app tab, then `window.open(url, '_blank')`.

## Task List
1) API: Add `format=json` handling to level-based modal redirect; return `{ url }` after logging; default remains 302.
2) UI: Update `page.tsx` FreeTrial modal CTA to fetch JSON first, then open returned URL; fallback to 302 if JSON fails.
3) Docs: Update `docs/app-overview.md` (modal CTA prefetch) and `docs/api-contracts.md` (query param contract and response shape).
4) CHANGELOG: Add FT-MODAL-JSON entry.

## Documentation Impact
- Document `?format=json` for `/api/v1/offer/free-trial/level/{level}/modal-redirect` with response `{ url: string }` and unchanged validations and logging.
- Clarify that modal CTA is non-claimable; Earn tile continues to use claimable flow.


