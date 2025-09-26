## Architectural Analysis
- In `/api/v1/tasks/{taskId}/claim`, when task partner_key='free_trial':
  - Find latest completed ad_event with matching `intent`.
  - Use `ad_events.id` as `p_idempotency_key` for `claim_task_v2`.
  - Mark ad_event `used`.

## Task List
1) Adjust claim route branch for Free Trial to ignore client idempotency header.
2) Keep Monetag/default branch unchanged.
3) Add tests/manual checks for ALREADY_CLAIMED and AD_REQUIRED.

## Documentation Impact
- api-contracts: Free Trial claim idempotency is derived from server-selected ad_event id.


