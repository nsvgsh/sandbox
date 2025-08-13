# CLIENT-HELPER — Implementation Plan

## Architectural analysis
- Keep a small helper module (local to the app) that wraps fetch, normalizes counters, and standardizes errors and retries. No global store.

## Task list
1. Create a helper file (e.g., apiClient.ts) with:
   - normalizeCounters(raw): returns { coins, tickets, coinMultiplier, level, totalTaps }
   - mapError(res/body): returns a small code set
   - request(url, opts): applies one retry for 429/409(after refresh)/network
2. Replace inline fetch + mapping in taps, bonus claim, task claim with the helper.
3. Ensure error display hooks into the unified codes (inline hint vs notice).
4. Lint and smoke-test happy and unlucky paths.

## Documentation impact
- Add a short note to docs about normalized counters and calm retries.

## Rollout
- Client-only change; incremental adoption across flows.
