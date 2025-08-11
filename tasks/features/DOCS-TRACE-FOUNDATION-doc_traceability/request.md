# Request: Documentation-driven traceability foundation

## What
Establish a documentation-first feature catalog and contracts matrix that map `docs/` requirements to implemented API routes and DB schema. Deliver:
- `docs/feature-catalog.md`
- `docs/contracts-matrix.md`

## Why
Create end-to-end traceability from product/game design to implementation, surface gaps, and enable deterministic planning for v1 delivery.

## Scope
- Read-only analysis of existing docs and code
- No behavioral changes
- Ticket-only deliverables under `docs/`

## Acceptance criteria
- Feature catalog lists core features, sources, entities, and acceptance at high level
- Contracts matrix covers all `/v1` routes, headers, responses, errors, idempotency, auth, DB touchpoints
- Gaps against `docs/api-contracts.md` are listed
