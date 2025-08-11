# REWARD-POLICY — Implement bonus/reward policy (coins vs tickets vs multipliers)

## WHAT
Codify a clear reward policy for level-up bonuses and claims:
- Level-up base payload: `{ coins: 0, tickets: 3, coin_multiplier: 0 }`
- Claim multiplier applies to each field in the payload (e.g., x2 → tickets 3→6)
- Progression coins are not credited by claim; claim coins are banked in `non_progress_coins`
- Claim is idempotent via `X-Idempotency-Key`

## WHY
- Avoid odd multi-level jumps on claim
- Make rewards predictable and tunable per field
- Keep progression strictly tap-driven; claim is a side reward

## Acceptance
- Level-ups add +3 tickets automatically without claim
- Claim with x2 adds +6 tickets, no level jump
- Ledger recorded once per idempotency key; counters consistent
