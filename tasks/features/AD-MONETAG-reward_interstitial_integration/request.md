# Feature Request — Monetag Rewarded Interstitial Integration (Phase 1)

## WHAT
Integrate Monetag Rewarded Interstitial into the Telegram Mini App to replace the local stub for ad‑gated flows:
- Level‑up x2 bonus
- Task unlocks (offers)

Use the official SDK via script tag (global function) controlled strictly by runtime config. Log both success and failure on the server; unlock rewards on successful close using existing TTL + idempotency flow.

## WHY
- Validate real ad delivery/UX inside Telegram WebView (Android/iOS)
- Preserve current economy gates (TTL, idempotent claims)
- Enable fast rollout and instant rollback via config (no redeploy)
- Collect observability from server logs (closed/failed) without new dashboards now

## Scope (Phase 1)
- Rewarded Interstitial only
- No automatic dev fallback (manual local simulate only, default OFF)
- No preload yet (add later)
- No mediation/backup network
- No extra rate limits/caps beyond TTL
- Retain `ad_events` indefinitely

## Out of Scope
- Rewarded Popup / In‑App modes
- npm package migration (`monetag-tg-sdk`)
- S2S postbacks and finance attribution
- Mediation / multi‑provider abstraction

## Acceptance Criteria
- SDK loads via script when `monetag_enabled=true` and required config present
- Successful close → `ad_events.status='closed'`, Monetag fields saved in `reward_payload`, TTL returned; claim with `x-idempotency-key` marks `used`
- Failures → no unlock, server `failed` event with reason
- Rollout/rollback via config flip; no redeploy
- Works on Android and iOS Telegram WebView

## Notes (Agreements from QA/discussion)
- unlock_policy = `any`
- All inputs from runtime config: `monetag_enabled`, `monetag_zone_id`, `monetag_sdk_url`, `unlock_policy`, `log_failed_ad_events=true`
- Canonical statuses: `closed`, `failed`, `used` (drop `completed`)


