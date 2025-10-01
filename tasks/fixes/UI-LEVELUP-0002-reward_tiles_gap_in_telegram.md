# UI-LEVELUP-0002 – Reward tiles gap in LevelUp modal (Telegram)

Problem:
- In Telegram, a visible gap appears between the bottom of each reward tile and the bottom of the rewards row.

Root Cause:
- `RewardPill` enforced a fixed aspect ratio (5/4), while `.rewardsRow` could be taller due to Telegram WebView safe areas and font metrics; the pill height didn’t stretch to fill the row, leaving a bottom gap.

Proposed Fix:
- Make `RewardPill` fill its grid cell height by removing the fixed aspect ratio and setting `height: 100%`.
- Slightly reduce `.rewardsRow` padding to minimize perceived gaps.
- Align modal overlay/card safe areas with app-wide Telegram CSS vars.

Result:
- Reward tiles stretch to fill the row without a bottom gap across Telegram clients and orientations.
