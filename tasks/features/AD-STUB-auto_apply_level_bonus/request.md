# AD-STUB — Auto-apply level bonus on ad_completed (local)

## WHAT
When the client logs `ad_completed` via `/api/v1/ad/log`, the server applies the incremental bonus (e.g., ×2 − base) to the latest eligible level-up, idempotent by impressionId.

## WHY
- Local dev without real ad SDK integration
- Align with product intent that bonus applies after an ad view, with no extra claim step

## ACCEPTANCE
- `/api/v1/ad/log` inserts an ad event (status=completed) and applies the level bonus if an eligible level_event exists within TTL and caps.
- Replays with same impressionId are no-ops (idempotent).
