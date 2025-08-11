# AD-SIM-INTENT — Intent‑coupled ad simulation (request)

## What
Tie each simulated ad view to the exact user action that triggered it ("bonus x2" or a specific task). After the view, only the matching claim becomes available; others stay disabled.

## Why
- Mirrors real flows and reduces false positives in local testing.
- Keeps users’ mental model clean: one ad unlocks one specific action.
- Enables per‑integration testing without over‑engineering.

## Scope
- In: passing a simple `intent` with ad logs; gating task claims by matching intent within a short window.
- Out: provider callbacks, reconciliation logic, new UI flows beyond showing the correct claim button.

## Acceptance (high‑level)
- Task claim without a matching recent ad‑intent returns `AD_REQUIRED`.
- Task claim after a matching recent ad‑intent succeeds instantly.
- Level bonus ad continues to apply bonus immediately; the claim tap only plays the animation.
