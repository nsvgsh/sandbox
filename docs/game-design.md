# Game design (v1)

## Core loop
Open app → tap to earn Coins → Coins auto‑convert to Levels at thresholds.
On level‑up, offer ad‑gated bonus multiplier (configurable, e.g., ×2) to multiply level‑up reward payload.
Optional tasks grant bonuses (including coin multipliers).

## Progression
- Level n requires 1,000 × n Coins (configurable; not hard‑coded).
- Level‑up converts required Coins into one Level; excess carries over.
- Each Level unlocks a task bundle; gating is data‑driven for future variation.
- Global leaderboard by total Levels.

## Currencies
- Coins: earned per tap (1 × coin_multiplier), tasks, level‑up rewards; spent automatically on level‑up.
- Levels: earned at thresholds; progression metric only.
- Tickets: granted by tasks/level‑ups; sink is gifts lottery post‑v1 (schema/UI ready; disabled in v1).

## v1 out of scope (hard cuts)
PvP, clans, premium currency/IAP, offline income, gacha/skins rarity, multi‑account cloud save, push re‑engagement,
complex ad formats, Telegram Stars, crypto rewards, daily goals/streaks, advanced anti‑cheat, full haptics/music polish.

## Multipliers & rewards
- Coin multiplier: persistent/timed boost; configurable.
- Level‑up reward payload: { coins, tickets, coin_multiplier }.
- Bonus multiplier (ad‑gated): policy‑driven application per type; skipping yields no multiplier.

## Configuration policy
Level thresholds, multipliers, unlock gates in config/constants or DB (not hard‑coded).

## Open v1 stubs
Task verification: stub interfaces and data model; actual verification TBD.
Ads taxonomy and caps: define provider, frequency caps, fallbacks in config.
Season mechanics: TBD; disabled in v1.
