# INGEST-SOFT — Soft-mode guards for ingest

## WHAT
Add soft validations to ingest: checksum awareness and tap clamp warnings driven by `game_config.ingest`.

## WHY
- Observe anomalies without breaking local UX; enable hard-reject later when stable

## ACCEPTANCE
- If taps > max_taps_per_batch and clamp_soft=true, process batch and log a structured warning.
- Checksum mismatches are logged; no rejection in soft mode.
