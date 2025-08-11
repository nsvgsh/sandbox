# UI-ACTUALIZE — Update local UI to actual app state (request)

## What
Bring the local UI in line with the current product flows:
- Intent‑coupled ad simulation: user taps a specific action ("bonus x2" or a concrete task); a simulated ad is tied to that action; after the view, only that claim becomes available.
- Session resume: use the new session claim to safely continue without resets.
- Surface key states: counters, next threshold, level‑up offer, tasks with clear availability, and simple error cues (e.g., AD_REQUIRED).

## Why
- Improve local confidence: flows match how the app behaves now.
- Reduce false positives in testing: one ad unlocks one action.
- Speed up iteration: quick manual testing for per‑integration behavior without extra tools.

## Scope
- In: client UI changes only; wire ad/log intent for level bonus and task claims; add resume via session claim; clarify states and TTL gating feedback.
- Out: design polish, partner SDKs, animations beyond basic feedback.

## Acceptance (high‑level)
- Tapping "bonus x2" triggers an ad view tied to level bonus and enables the final confirm step (visual only; bonus already applied).
- Tapping a task's "watch ad" triggers an ad tied to that task; only that task’s claim becomes available and succeeds.
- Reload/return: session claim restores state without confusion; counters/tasks remain consistent.
