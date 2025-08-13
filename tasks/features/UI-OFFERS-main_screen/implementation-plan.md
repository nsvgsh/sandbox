# UI-OFFERS — Implementation Plan

## Architectural analysis
- Evolve `web/src/app/page.tsx` in-place; add an Offers section rendered when the Offers tab is active (no route changes).
- Reuse existing endpoints: GET `/api/v1/tasks`, POST `/api/v1/ad/log` (intent-bound), POST `/api/v1/tasks/{taskId}/claim`, GET `/api/v1/config` for `ad_ttl_seconds`.
- Persist unlocks per task in `sessionStorage` as `{ impressionId, expiresAt }`, hydrate into local state on mount.
- Represent “EXPIRED” as local-only UX derived from elapsed unlocks; backend has no offer validity windows.

## Task list
1. Add an in-page nav state to toggle between Home and Offers; highlight Offers in `BottomNav` when active.
2. Build a Tabs component (AVAILABLE, COMPLETED, EXPIRED) with keyboard/a11y semantics.
3. OfferCard (in-file): banner placeholder, reward summary formatter, CTA area with two states:
   - Pre-ad: “Watch ad” → `/api/v1/ad/log` with `intent='task:<id>'`, store unlock in state + sessionStorage
   - Post-ad: “Claim (Xs)” until TTL; disable on expiry
4. Unlock persistence: hydrate from sessionStorage on mount; interval tick to update countdowns; prune expired unlocks and add to a transient EXPIRED bucket for UI.
5. Claim handling: POST claim; on success, clear unlock and refresh tasks + counters; on `AD_REQUIRED`, inline hint and revert CTA; generic errors via toast.
6. Empty/loading states per tab; prevent layout shifts.
7. Keep existing debug/admin sections below; no regression.

## Documentation impact
- `docs/api-contracts.md` (UI notes): intent-coupled ad unlock per task, advisory countdown, server TTL is authoritative.
- `docs/app-overview.md`: describe the Offers flow and the tabs behavior.

## Rollout
- UI-only; no backend changes for this iteration. If future parity with bonus path is desired (mark ad as `used` on claim), file a separate micro-migration ticket.
