# Game design (v1)

## Core loop
Open app → tap to earn Coins → Coins auto‑convert to Levels at thresholds.
On level‑up, offer ad‑gated bonus multiplier (configurable, e.g., ×2) to multiply level‑up reward payload.
Optional tasks (ad-views, by default) grant bonuses (including coin multipliers).

## Progression
- No-spend: coins never decrease. Level‑up occurs when current coins reach an absolute threshold.
- Thresholds are polynomial: coins_required(L) = floor(a0 + a1*L + a2*L^2 + a3*L^3); coefficients configurable via DB.
- Excess coins naturally carry over to future thresholds; no conversion/spend on level‑up.
- Each Level can unlock tasks; gating is data‑driven.
- Global leaderboard by total Levels.

- Coins: earned per tap (coins_per_tap × coin_multiplier), tasks, level‑up rewards; not spent on level‑up (no‑spend).
- Levels: earned at thresholds; progression metric only.
- Tickets: granted by tasks/level‑ups; sink is gifts lottery post‑v1 (schema/UI ready; disabled in v1).

## v1 out of scope (hard cuts)
PvP, clans, premium currency/IAP, offline income, gacha/skins rarity, multi‑account cloud save, push re‑engagement,
complex ad formats, Telegram Stars, crypto rewards, daily goals/streaks, advanced anti‑cheat, full haptics/music polish.

## Multipliers & rewards
- Coin multiplier: persistent/timed boost; configurable.
- Level‑up reward payload: { coins, tickets, coin_multiplier } — base is granted immediately on level-up.
- Bonus multiplier (ad‑gated): applies the incremental portion over the granted base (e.g., x2 adds +base); skipping yields no multiplier.

## Configuration policy
Level thresholds, multipliers, unlock gates in config/constants or DB (not hard‑coded).

## Open v1 stubs
Task verification: stub interfaces and data model; actual verification TBD.
Ads taxonomy and caps: define provider, frequency caps, fallbacks in config.
Season mechanics: TBD; disabled in v1.


## Rewards policy (v1)
- Default base: coins and/or tickets per level via templates; tickets often present; coin_multiplier optional.
- Claim multiplier policy per field (config-driven). For multiplicative fields, only the incremental part is applied (base × (multiplier−1)).
- Coins from claims affect progression (local v1); may be adjusted by policy in future.
