# OPS-FLUSH-IMMEDIATE — Immediate flush on threshold (WHAT & WHY)

## What
- Ensure client sends a batch when the tap count reaches a configured threshold, without waiting for the next timer tick.
- Compute effective threshold as min(tap_agg.flush_threshold, ingest.max_taps_per_batch) from /v1/config.
- Keep timer-based flush (batch_min_interval_ms) for rate limiting.

## Why
- Prevent oversized batches between timer ticks when the user taps fast.
- Preserve UX (same visuals and timings) while guaranteeing "once per N taps" behavior.
