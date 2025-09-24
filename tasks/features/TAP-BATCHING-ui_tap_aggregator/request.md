# TAP-BATCHING – UI tap aggregator (Request)

## WHAT
Introduce a minimal client-side tap aggregator with optimistic, flicker-free coin rendering and coalesced network flushes. Replace per-tap POSTs with time/size-based batches while keeping the server authoritative for ledgered state (levels, tickets, durable counters).

Scope:
- Aggregate taps locally; POST coalesced counts on an interval/threshold.
- Optimistically render coins derived from last confirmed counters plus pending taps × coin_multiplier.
- Reconcile monotonically with server responses; never visually decrement coins.
- Preserve server authority for level-ups, tickets, thresholds.

Out of scope:
- WebSockets/SSE, leases, or offline modes.
- Changes to backend progression logic.

## WHY
- Eliminate coins counter flicker and UI dependence on network latency.
- Support any user tap frequency without saturating the API.
- Reduce request volume with coalesced batches while respecting existing server authority and policies.

## Acceptance
- Header coins render smoothly under high tap rates; no visible flicker/jumps.
- Requests are coalesced (taps per request > 1 under rapid tapping).
- Level-ups and rewards remain strictly server-driven.
- No regressions in session/seq handling; 429/409 are retried transparently.
