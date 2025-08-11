# Implementation Plan — REWARD-POLICY

## Architectural Analysis
- SQL is source of truth for level-ups and claims
- Introduce `non_progress_coins` in `user_counters` to bank claim coins
- Modify `apply_tap_batch` to auto-apply base tickets per level; preserve existing ingest flow
- Modify `claim_level_bonus` to multiply payload fields, bank coins, add tickets, enforce idempotency

## Task List
1) DB: add `non_progress_coins` column to `user_counters`
2) SQL: update `apply_tap_batch` to accumulate base tickets per level gained
3) SQL: update `claim_level_bonus` to apply policy and idempotency
4) API: require `X-Idempotency-Key` on claim; pass to SQL
5) UI: show level-up banner and call claim with idempotency key; display updated counters
6) Observability: add structured logs for ingest and claim

## Documentation Impact
- Update `docs/game-design.md` (reward policy and level-up defaults)
- Update `docs/db-models.md` (`non_progress_coins`)
- Update `docs/api-contracts.md` (claim idempotency header)
