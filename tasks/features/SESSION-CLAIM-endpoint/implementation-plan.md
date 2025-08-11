# SESSION-CLAIM — Implementation Plan

## Architectural analysis
- Current model
  - `session_start(p_user_id)` rotates `session_epoch` and issues a new `current_session_id`; resets `last_applied_seq=0` in `user_counters`.
  - Ingest path `apply_tap_batch(...)` enforces `session_epoch` equality and checks `client_seq` monotonicity; rejects with `SUPERSEDED` or `SEQ_REWIND`.
  - API exposes `POST /v1/session/start` which returns `{ sessionId, sessionEpoch, lastAppliedSeq }` from SQL.
- Gap
  - `POST /v1/session/claim` is documented but missing. We need a safe resume endpoint that does not mutate counters and only rotates when the client is out of sync.
- Policy
  - Favor continuity: if the client presents matching `sessionId` and `sessionEpoch`, we simply echo the authoritative server values.
  - If either is missing/mismatched or the server has rotated since, we rotate (call `session_start`) and return fresh values.
  - Never increase `lastAppliedSeq`; it reflects the last fully applied batch.

## API contract
- Route: `POST /v1/session/claim`
- Body: `{ sessionId?: string, sessionEpoch?: string }`
- Response: `{ sessionId: string, sessionEpoch: string, lastAppliedSeq: number }`
- Errors: 401 unauthorized; 400 for malformed UUIDs; 500 on server error.

## Security & idempotency
- Requires user context (same auth as other endpoints in dev: `dev_session` cookie).
- Stateless: no side effects unless rotation is needed.
- Rotation is idempotent per call because `session_start` always generates a new ids; callers should cache the returned pair.

## Edge cases
- Client provides valid `sessionId` but stale `sessionEpoch` → rotate.
- Client provides nothing → rotate.
- Race: client calls claim while another device rotates epoch → we return the latest from DB; ingest will still guard.
- Bad UUID formats → 400.

## Tasks
1. Add endpoint file `web/src/app/api/v1/session/claim/route.ts` with runtime nodejs.
2. Read cookie for user; parse JSON with optional fields.
3. Validate UUID format if provided.
4. Load current `user_counters` row; if none, fall back to `session_start`.
5. Compare provided vs server `current_session_id` and `session_epoch`.
   - Match both → return `{ sessionId: current_session_id, sessionEpoch: session_epoch, lastAppliedSeq }`.
   - Else → call `session_start(user_id)` and return fresh values.
6. Logging: structured logs for decision branch (matched vs rotated) with masked user id.
7. Tests: manual
   - Fresh user → rotate (start) → returns epoch/ids.
   - Matching pair → echo existing.
   - Mismatch → rotate.

## Documentation impact
- `docs/api-contracts.md`: ensure route is listed with request/response.
- `docs/feature-catalog.md`: mark SESSION-CLAIM as Done once merged.
- `docs/deploy-pipeline.md`: add smoke check `POST /v1/session/claim`.

## Rollout
- Ship behind nothing (safe); no schema change.
- Verify locally with dev cookie, then add to smoke checks.
