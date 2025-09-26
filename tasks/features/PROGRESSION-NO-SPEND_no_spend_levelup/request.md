# Feature Request: No-spend level-ups (coins never decrease)

## WHAT
- Remove the only remaining spend mechanic: coin deduction of level thresholds during level-up.
- Coins should only increase from taps and rewards. Level-up triggers when current coins reach the absolute threshold for the next level, without subtracting any coins.

## WHY
- Current product has no user-initiated spending flows; the only spend is implicit (threshold subtraction), which is counter to the desired economy.
- Simplifies mental model: tap → coins go up; hit threshold → level up; receive rewards; continue.
- Reduces friction in UX and lowers surprises for users watching balances.

## Scope
- Server: update `apply_tap_batch` to stop subtracting thresholds during level-up. Keep Free Trial and rewards logic intact. Keep rewards after loop so they do not chain more level-ups within the same batch.
- Config: may need threshold tuning (base increase) to maintain progression pace.
- UI/Docs: document the no-spend leveling design; no UI changes are required.

## Non-Goals
- No changes to tasks claiming, x2 bonus gating, or session/idempotency.
- No introduction of new progression metrics (XP) in this feature.


