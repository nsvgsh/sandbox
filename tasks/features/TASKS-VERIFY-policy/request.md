# TASKS-VERIFY — Task verification policy (request)

## What
Define a simple, user-first policy for task verification: grant rewards instantly based on in‑app proof, and record any partner confirmations later without blocking or clawbacks.

## Why
- Keep the experience smooth and predictable; no waiting screens or reversals.
- Still capture partner truth for payout reporting.
- Avoid over-engineering: no periodic checks, no reconciliation, no take‑backs.

## Scope
- In: product policy, documentation updates, guardrails (light caps/window), and keeping current code paths aligned (no blocking on partner answers).
- Out: provider webhooks or partner integrations (handled separately), complex verification states in UI, reconciliation jobs.

## Acceptance (high‑level)
- Claims succeed instantly; no new blockers introduced by verification.
- If a partner later pings, we record it; user rewards remain unchanged.
- Documentation clearly states do’s and don’ts for this policy.

