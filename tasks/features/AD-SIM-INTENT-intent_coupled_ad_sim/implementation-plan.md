# AD-SIM-INTENT — Implementation Plan (Approach A)

## Architectural analysis (brief)
- Today: `POST /v1/ad/log` records an ad and (locally) applies level bonus; task claim checks any recent ad.
- Gap: ad isn’t bound to the action; any ad can unlock any task in the window.

## Plan
- Accept `intent` with ad logs: `"level_bonus"` or `"task:<taskId>"`.
- Store `intent` in `ad_events.reward_payload.intent` (no schema change needed).
- Task claim gate: require a recent ad with `intent = 'task:<taskId>'`.
- Level bonus: ad with `intent='level_bonus'` keeps current behavior; claim button just animates.
- TTL stays as is from config; window is short by default.

## Tasks
1. Add docs: extend `POST /ad/log` body to include `intent`.
2. Update ad log route to capture `intent`.
3. Update task claim route to match `intent='task:<id>'` when checking recent ad.
4. Add CHANGELOG and smoke test (curl) cases.

## Docs impact
- `docs/api-contracts.md`: document `intent` for `/ad/log` and gating semantics.
- `docs/feature-catalog.md`: add AD-SIM-INTENT once merged.

## Rollout
- Backward compatible: if `intent` missing, keep existing behavior for local.
- Enable stricter gating in local by always passing `intent` from UI and tests.
