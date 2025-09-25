## Architectural Analysis
- Add `level_offer_schedule(level pk, active, skip_base_reward=true, partner_key='free_trial', payload jsonb, updated_at, task_id uuid unique not null)`.
- Ensure a 1–1 mapping between schedule rows and `task_definitions` entries (definition-driven tasks). Provide a helper to sync.
- Modify `apply_tap_batch` to consult schedule and, when `skip_base_reward=true`, skip base template grants and still insert a neutral `level_events` row.
- Redirect endpoint: generate UUIDv4 click-id, insert `ad_events` with `provider='free_trial'`, `placement='earn'|'level_up_modal'`, `status='completed'`, and `reward_payload` including `{ impressionId, intent: 'task:<taskId>' }` for EARN only, then 302 to partner URL with `_ocid` and `aff_subid` from DB config.
- Claim: If task partner_key='free_trial', require latest unused `ad_events` with matching `intent` and no TTL; mark used after claim.

## Task List
1) Migration: create `level_offer_schedule`, config keys (`free_trial_url_template`, `free_trial_source`), index on `ad_events` intent; add sync helper.
2) SQL: update `apply_tap_batch` to check schedule and skip base rewards per scheduled level.
3) API: add `/api/v1/offer/free-trial/[taskId]/redirect` with host restriction and logging.
4) API: adjust `/api/v1/tasks/[taskId]/claim` to handle Free Trial branch (no TTL; consume click).
5) API: extend `/api/v1/tasks` to join schedule and include partner metadata.
6) UI: Level-up modal variant; EARN tile CTA uses redirect endpoint; styling tweak for debug outline.
7) Docs: update `docs/api-contracts.md`, `docs/db-models.md`, and `docs/app-overview.md`.
8) Rollout: seed schedule rows and validate flows; add CHANGELOG entries.

## Documentation Impact
- New table and config keys documented; updated task claim semantics for partner.
- Redirect endpoint contract and safety constraints.


