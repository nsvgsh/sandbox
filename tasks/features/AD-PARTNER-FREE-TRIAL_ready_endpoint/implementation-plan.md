## Architectural Analysis
- Readiness = exists completed ad_event with intent `task:<taskId>` and status!='used'; claimed tasks report claimed=true, ready=false.
- Endpoint GET `/api/v1/tasks/{taskId}/ready`:
  - Auth: dev_session cookie.
  - Validate: partner task (free_trial) and active.
  - Return: { ready, claimed, lastClickAt?, clicks? }.
- UI: On partner Open:
  - Open redirect in new tab.
  - Run readiness once on focus (plus initial short delay) and flip CTA to Claim by setting local unlock.

## Task List
1) API route in Next: GET `/api/v1/tasks/[taskId]/ready`.
2) UI: add readiness check on window focus for partner tasks; setUnlockForTask when ready.
3) Docs: update api-contracts and app-overview.
4) Changelog: add entries.

## Documentation Impact
- New endpoint contract and Free Trial UX explained.
