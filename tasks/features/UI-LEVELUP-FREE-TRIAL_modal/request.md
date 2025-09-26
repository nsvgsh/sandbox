## Request: Free Trial Level-Up Modal

### WHAT
- Show a dedicated Free Trial modal on level-up when `unlockLevel` is scheduled in `level_offer_schedule` with `partner_key='free_trial'` and `skip_base_reward=true`.
- The modal has header (same as regular) and an expanded rewards area with an asset and one CTA.
- CTA opens a non-claimable partner redirect (modal placement) in a new tab; closing does not change claim state.

### WHY
- Separate UX and avoid confusion with the bonus/X2 flow. Keep claim path on the Earn screen only.


