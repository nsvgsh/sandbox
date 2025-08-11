# LVL-TEMPLATES — Per-level reward templates

## WHAT
Introduce data-driven per-level reward payloads, resolved at level-up and snapshotted into `level_events.reward_payload`. Provide a global default (level=0) fallback.

## WHY
- Curate milestone rewards without code deploys
- Enable safe hotfixes and seasonal overrides later

## ACCEPTANCE
- On level-up, the server resolves a template for each crossed level and stores its payload in `level_events`.
- If no exact level row exists, fallback to level=0 row; if missing, use a minimal safe payload.
- Base payload is granted immediately; bonus remains ad-gated and incremental.
