# Feature Request — ADS-PROPELLER-0001 — PropellerAds S2S conversion tracking

## What
- Integrate PropellerAds Server-to-Server (S2S) conversion tracking to attribute user conversions that originate from PropellerAds traffic.
- Support Telegram startapp-parameter based attribution for campaigns that deep-link to the bot/mini app.
- Provide a reliable, idempotent server-side postback sender that reports conversions back to PropellerAds using the dashboard-provided Postback URL.

## Why
- S2S postbacks provide accurate attribution without relying on client cookies or pixels.
- Enables campaign optimization in PropellerAds by feeding verified conversion events (e.g., registration, key in-app actions) tied to the click identifier (SUBID).
- Aligns with PropellerAds documentation and constraints for Telegram flows (64-char `startapp` param; allowed charset; token format).

## Scope
- Parse and store PropellerAds identifiers from Telegram `startapp` payload: `${SUBID}`, `{campaignid}`, `{zoneid}`, and a network tag (e.g., `prop`).
- Map internal conversion events to PropellerAds goals (main conversion and optional goal=2/3... for deeper funnel events).
- Send S2S postbacks from server with retries and deduplication.
- Add operational configs (env/runtime config) for the PropellerAds Postback URL and toggles.

## Non-Goals (initial)
- Building a generic attribution layer for all ad networks (keep extension-friendly though).
- Historical backfill of conversions prior to this integration.

