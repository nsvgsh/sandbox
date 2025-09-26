# Implementation Plan — ADS-PROPELLER-0001 — PropellerAds S2S conversion tracking

## Architectural analysis

PropellerAds requires that we:
- Capture their click identifier `${SUBID}` (or an alias) at traffic entry.
- Persist it with the user/session initiated via Telegram `start` param: `start=${SUBID}_{campaignid}_{zoneid}_prop` (underscore-delimited, max 64 chars, restricted charset).
- On conversion, send an S2S GET (or POST) request to their Postback endpoint with `visitor_id=${SUBID}` and optional `goal`.

Implications for our stack:
- Telegram entry: We already parse `initData` for TMA; we must also parse `start` payload. Store parsed pieces in DB (e.g., `ad_attribution` table keyed by `tg_user_id` or `session_id`).
- Event sourcing: For each tracked conversion (e.g., registration, level milestones, purchase-like actions), emit a durable event into our tasks/events pipeline (see `supabase` migrations), then an outbox/worker sends the PropellerAds postback.
- Idempotency: Maintain an outbox with a unique key per (`SUBID`, `goal`, `event_kind`) to avoid duplicate postbacks. Store result and response code for observability.
- Config: Place Postback base URL (aid/pid/tid tokens) in runtime config/env; do not hardcode. Allow toggling integration on/off and environment targeting (staging/production).
- Retries: Exponential backoff on non-2xx; drop or alert after max attempts.

## Data model

1) Attribution capture
- Table: `ad_attribution` (user_id, tg_user_id, network, subid, campaign_id, zone_id, created_at)
- Indexes on user_id and subid

2) Outbox
- Table: `ad_postback_outbox` (id, network, subid, goal, event_kind, status, attempt_count, last_attempt_at, last_response_status, last_response_body, created_at)
- Unique index on (network, subid, goal, event_kind)

## Runtime config

- `PROPELLER_POSTBACK_BASE_URL` e.g. `http://ad.propellerads.com/conversion.php`
- `PROPELLER_AID`, `PROPELLER_TID`, optional `PROPELLER_PID`
- `PROPELLER_ENABLED` boolean

## Task list

1. Parse Telegram `start` parameter and persist attribution
2. Add conversions→goal mapping in code (main, goal=2/3)
3. Create postback client with retry and metrics
4. Implement outbox producer/consumer for postbacks
5. Add runtime config and secure loading
6. Add admin/dev tools to inspect outbox and resend
7. Add docs: API contracts, app-overview update, changelog entry

## Documentation impact

- Update `docs/api-contracts.md` with attribution start param contract and postback behaviors
- Update `docs/app-overview.md` with attribution and outbox flow diagram
- Add PropellerAds configuration details to `docs/deploy-pipeline.md` and `.env.example`

## Risks & mitigations

- 64-char limit overflow: validate and truncate gracefully; ensure `${SUBID}` is intact
- Duplicate/late events: idempotent keys and outbox guard
- Network/endpoint changes: config-driven URL and tokens
- PII leakage: send only required identifiers, no user PII

