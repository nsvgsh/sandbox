# UI-MONETAG-0001 — SDK loader and error handling hardening

## Problem
`show_XXX` was undefined until ad‑hoc injection; preload returned `Network error`. Network tab showed CORS/400 to `d3rem.com/.../MAIN_ZONE_ID`.

## Root Cause
- Placeholder zone id (`MAIN_ZONE_ID`) used during injection.
- Fragile loader: no cache‑bust, no explicit function name, no readiness wait.
- Error categorization too coarse; hard to tell CORS/400/no-feed apart.

## Proposed Fix
- Loader accepts explicit SDK function name and validates zone id.
- Cache‑bust dev loads; ensure single‑tag injection; wait for readiness.
- Add `preloadMonetag()` with timeout; expand error categories (cors, bad_request, no_feed, etc.).

## Status
Implemented in `web/src/lib/ads/monetag.ts`.
