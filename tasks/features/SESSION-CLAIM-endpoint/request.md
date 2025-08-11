# SESSION-CLAIM — Session claim endpoint (request)

## What
Introduce `POST /v1/session/claim` that lets a client resume gameplay safely after interruptions by returning authoritative session parameters: `{ sessionId, sessionEpoch, lastAppliedSeq }`.

## Why
- Preserve user confidence: resuming should feel instant and safe.
- Align with server‑authoritative ingest: the server controls epoch and sequence.
- Reduce friction: avoid unnecessary resets when the client’s session is still valid.

## Scope
- In: endpoint that validates the client’s provided `sessionId` and `sessionEpoch` against server state and returns authoritative values, including `lastAppliedSeq`.
- Out: authentication changes, complex rate limiting, telemetry dashboards, client SDK work beyond using the new endpoint.

## Acceptance (high‑level)
- If the client’s session matches the server, return the same `sessionId`/`sessionEpoch` and the current `lastAppliedSeq`.
- If missing or mismatched, rotate by calling the existing `session_start` and return new `sessionId`/`sessionEpoch` with `lastAppliedSeq=0`.
- Never advance `lastAppliedSeq`; the endpoint is read/rotate only.
- Errors: 401 when unauthenticated; 400 on malformed payload.
