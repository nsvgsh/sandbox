# TASKS-VERIFY — Implementation Plan (policy)

## Architectural analysis
- Current state
  - `claim_task(p_user_id, p_task_id)` grants immediately when `verification='none'`; API enforces recent ad view for ad‑type tasks via `ad_events.status='completed'` within TTL.
  - No provider callback path is wired; `ad/log` uses client signals and can auto‑apply level bonus in local.
- Policy goal
  - Keep claims instant; verification is record‑only and optional.
  - No periodic checks; partner pings (if any) only flip a stored mark for reporting.
  - No clawbacks or retro changes to counters.

## Policy definition
- Do
  - Grant instantly based on in‑app proof.
  - Record partner status later as confirmed/rejected/unknown (if integration exists).
  - Use light caps and a short eligibility window from config for ad‑gated tasks.
- Don’t
  - Block rewards on partner answers or claw them back.
  - Add periodic checks or reconciliation jobs.
  - Over‑engineer matching: require a single shared marker; duplicates ignored.

## Minimal changes
1) Documentation
  - Add policy section to `docs/api-contracts.md` or a dedicated policy note under tasks.
  - Clarify that verification does not affect user rewards.
2) Config
  - Ensure `game_config` includes `ad_ttl_seconds` (exists) and optional `task_caps` placeholder (document only; no code changes now).
3) Code alignment (no functional change)
  - Keep `tasks/[taskId]/claim` logic: accept recent ad with `status='completed'` within TTL; continue returning `AD_REQUIRED` otherwise.
  - No changes to `claim_task` SQL function.

## Tasks
- Write `request.md` and this `implementation-plan.md` (done).
- Update documentation with a concise “Task verification (policy)” section.
- Add a single line to `CHANGELOG.md` when done.

## Documentation impact
- `docs/api-contracts.md`: add a short policy note under routes/tasks.
- `docs/feature-catalog.md`: include this policy under design notes for tasks.

## Rollout
- Documentation-only change; code already aligns with policy.

