# Implementation Plan — Monetag Rewarded Interstitial (Phase 1)

## Architectural Analysis
- Frontend already has ad-gated flows using a stub (`/api/v1/ad/log` + TTL + idempotent claims). We will replace the stub with Monetag SDK (script tag global) guarded by runtime config.
- Canonical statuses in `ad_events`: `closed` (success), `failed` (attempt failed), `used` (consumed by claim). Drop `completed` to avoid ambiguity.
- Persist Monetag fields in `ad_events.reward_payload` for observability and future policy checks.
- Decisions acknowledged: unlock_policy=`any`; `monetag_enabled` controls rollout; server logs failures; no auto dev fallback; no extra caps/rate limits; retain events indefinitely.

## Task List
1) Runtime config (no hard-coding)
   - Add keys in `game_config` and serve via `/api/v1/config`:
     - `monetag_enabled` (boolean), `monetag_zone_id` (string), `monetag_sdk_url` (string), `unlock_policy` ('any'|'valued'), `log_failed_ad_events` (boolean, default true).
   - Extend client `parsePublicConfig()` to read these keys.

2) SDK loader (client)
   - Client-only component to inject `<script src={monetag_sdk_url} data-zone={monetag_zone_id} data-sdk={"show_"+zone}>` when `monetag_enabled` is true.
   - Readiness check: global `show_<zone>` function exists before usage.

3) Thin adapter
   - `web/src/lib/ads/monetag.ts`: `isLoaded(zoneId)`, `showRewardedInterstitial({ ymid, requestVar })` → calls `show_<zone>({ type:'end', ymid, requestVar, catchIfNoFeed:true })` and returns the SDK Promise.

4) Wire level bonus flow
   - On click: generate `impressionId`; `ymid = userId:impressionId`; call adapter.
   - On success: POST `/api/v1/ad/log` with `{ status:'closed', provider:'monetag', placement:'level_bonus', intent:'level_bonus', impressionId }` and include Monetag fields in `reward_payload`.
   - Use response TTL to enable confirm countdown; claim with `x-idempotency-key`.
   - On failure: show notice; if `log_failed_ad_events`, POST `/api/v1/ad/log` with `{ status:'failed', placement:'level_bonus', reward_payload:{ reason: code, error_message? } }`.

5) Wire task unlock flow
   - Same as level bonus with `placement:'task_claim'`, `intent:'task:<id>'`; on success set per-task unlock with TTL; on failure do not unlock and optionally log `failed`.

6) Backend alignment
   - Ensure `/api/v1/ad/log` accepts `status in ('closed','failed')` and sets `used` on claim success elsewhere.
   - Persist Monetag fields for `closed`: `reward_event_type`, `zone_id`, `sub_zone_id`, `ymid`, `request_var`, `estimated_price?`, plus `impressionId` and `intent`.
   - For `failed`: persist `reason` in {'no_feed','sdk_not_loaded','timeout','popup_blocked'} and `error_message?`.
   - Confirm DB constraint allows `used`; adjust migration if needed.

7) Edge cases & safeguards
   - Missing config: do not attempt to load/call SDK; show notice; optionally log `failed (sdk_not_loaded)`.
   - TTL expiry: client disables button; server returns `TTL_EXPIRED` on late claim.
   - Double-claim: idempotent behavior; treat as success or `ALREADY_CLAIMED`.
   - Session 401: surface error; do not unlock.

8) Rollout & rollback
   - Rollout: set `monetag_enabled=true` for all users.
   - Rollback: set `monetag_enabled=false`; no redeploy.

## Documentation Impact
- Update `docs/api-contracts.md`: `/api/v1/ad/log` behaviors, statuses, payload fields, and TTL response.
- Update `docs/db-models.md` and `docs/db-schema.sql` to reflect `ad_events.status` canonical values and payload contents.
- Update `docs/app-overview.md` external integrations to include Monetag.

## Validation Checklist
- Android & iOS Telegram: success path (closed → unlock → claim → used).
- Failure cases: no_feed, sdk_not_loaded, timeout; server `failed` rows appear; no unlock.
- TTL expiry and idempotent re-claim behave as expected.

## Rollout Notes
- No rate limiting/caps beyond TTL for this phase.
- Retain all `ad_events` indefinitely (storage monitored later).


