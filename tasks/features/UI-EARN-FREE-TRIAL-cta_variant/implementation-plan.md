## Architectural Analysis
- EarnGrid recognizes partner tasks by `partnerKey==='free_trial'`.
- Base CTA opens `/api/v1/offer/free-trial/{taskId}/redirect` (claimable click with intent); after focus, readiness may flip the CTA to Claim.
- Styling uses a dedicated partner variant; logic preserves normal tasks behavior.

## Task List
1) Add partner branch in EarnGrid (CTA label/variant; open in new tab).
2) On focus, call readiness; flip CTA to Claim when ready; on AD_REQUIRED clear unlock.
3) Keep non-partner flow unchanged.

## Documentation Impact
- app-overview: Earn partner tile behavior; no TTL; readiness-based claim.


