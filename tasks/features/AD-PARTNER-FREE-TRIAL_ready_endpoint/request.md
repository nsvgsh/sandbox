## Request: Free Trial Readiness Endpoint and UI Wiring

### WHAT
- Add GET `/api/v1/tasks/{taskId}/ready` to report readiness for Claim for Free Trial tasks.
- Update Earn UI to call readiness after partner redirect (focus-based), flip CTA to Claim.

### WHY
- Free Trial has no SDK callback and no TTL; we need a lightweight way to let the UI know when redirect click has been recorded so the user can claim.
