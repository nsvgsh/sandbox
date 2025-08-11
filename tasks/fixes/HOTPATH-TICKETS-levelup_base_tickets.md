# HOTPATH-TICKETS — Apply base tickets on level-up

## Problem
Base tickets configured for level-up reward were not increasing `user_counters.tickets` during multi-level gains on ingest.

## Root Cause
`apply_tap_batch` inserted `level_events` but did not accumulate and apply tickets delta for levels gained.

## Fix
Add `v_tickets_base_total` accumulation in the level-up loop and include in the same `user_counters` update transaction.
