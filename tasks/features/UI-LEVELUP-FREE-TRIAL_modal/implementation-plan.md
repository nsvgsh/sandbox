## Architectural Analysis
- Modal renders only for scheduled Free Trial levels; regular modal otherwise.
- Non-claimable CTA: uses `/api/v1/offer/free-trial/{taskId}/modal-redirect` which logs `ad_events` with placement='level_up_modal' and no `intent`.
- Component isolation: `FreeTrialLevelUpModal` with its own CSS module (ft-* classes) to avoid style bleed with regular modal.
- After opening partner tab, on window focus CTA flips to a return state (close modal).

## Task List
1) Create `FreeTrialLevelUpModal` with header + expanded rewards (asset + single CTA).
2) Add modal-redirect API route (done) and wire CTA to open in new tab.
3) Add close controls (overlay click + subtle corner button on card).
4) Ensure no internal scroll in rewards; increase card height for FT when needed.
5) Integrate in `page.tsx` via decision gate (see separate ticket).

## Documentation Impact
- app-overview: Level-up can render regular or Free Trial modal; Free Trial CTA does not unlock claim.
- api-contracts: ensure modal-redirect described as non-claimable.


