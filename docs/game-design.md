# Game Design

## Core Loop
1. Tap the central element to earn **Coins**.
2. When Coins ≥ `1 000 × current level`, you level-up automatically; excess Coins carry over.
3. After each level-up a rewarded ad offers **2× Coins**.
4. Every 5 levels unlocks a **task bundle**; completing its tasks grants a **Ticket**.
5. Repeat – leaderboard ranks by total lifetime levels.

## Progression Formula
```
level_n_threshold = 1_000 * n
```

## Currencies
| Name     | Earned via                        | Spent / Usage                             |
| -------- | --------------------------------- | ----------------------------------------- |
| Coins    | Taps, rewarded ads               | Consumed automatically on level-up        |
| Levels   | Threshold met                    | Non-spendable metric for progression      |
| Tickets  | Task bundles, ads                | Not spendable in v1 (saved for v2)        |

## v1 Scope (Hard Exclusions)
* No PvP, guilds, gacha, premium currency, IAP.
* No offline income, cloud sync, push notifications.
* No interstitials or offerwalls – only rewarded ads.

## Wireframes / Mocks
See `/docs/UI-mocks-wireframes/` for reference screenshots of **Home**, **Offers**, and **Wallet** screens.

