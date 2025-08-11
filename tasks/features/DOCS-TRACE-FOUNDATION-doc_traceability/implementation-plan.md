# Implementation Plan: Documentation-driven traceability foundation

## Architectural analysis
- Documentation is the source of truth; code in `web/src/app/api/v1/**` and schema in `docs/db-schema.sql` must align.
- Introduce two durable artifacts:
  - `docs/feature-catalog.md`: enumerates features, sources, entities, acceptance.
  - `docs/contracts-matrix.md`: maps routes to method, headers, request/response, errors, idempotency, auth, DB touchpoints.

## Tasks
1) Extract implemented endpoints and DB touchpoints from code and schema.
2) Cross-check against `docs/api-contracts.md` and `docs/game-design.md`.
3) Author `docs/feature-catalog.md`.
4) Author `docs/contracts-matrix.md` including list of documented-but-missing endpoints.
5) Open follow-up tickets for missing endpoints.

## Documentation impact
- Adds two new docs under `docs/`.
- Establishes baseline for future gap-tracking in `tasks/` tickets.

## Acceptance criteria
- Both docs present and cover all current routes and DB touchpoints.
- Missing documented endpoints clearly listed for planning.
