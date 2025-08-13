# CLIENT-HELPER — Minimal API helper (normalize + retries)

## What
Introduce a tiny request helper for the UI that:
- Normalizes counters into one shape: { coins, tickets, coinMultiplier, level, totalTaps }
- Unifies simple error mapping: TooFast (429), OutOfDate (409), AdRequired, AlreadyClaimed, Expired, Generic
- Applies calm retry rules: one retry only for 429/409 (after refresh)/network

## Why
- Reduce duplication and bugs across screens, keep components thin, and make behavior predictable.

## Scope
- In: a lightweight helper (no global store) and adoption in taps, bonus claim, task claim code paths.
- Out: state management library, server-side changes.

## Acceptance
- Taps/bonus/tasks use the helper for request/response and error mapping.
- Counters mapping exists in one place.
- No infinite loops; max one retry per action.
