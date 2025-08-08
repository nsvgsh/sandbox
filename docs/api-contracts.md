API Contracts (Edge Functions)

Routes
| # | Path | Method | Auth | Req JSON | Resp JSON | Notes |
|---|------|--------|------|----------|-----------|-------|
| 1 | /auth/tg | POST | header `Authorization: tma <initData>` | – | `{ token, player }` | Validates initData, returns Supabase JWT |
| 2 | /me | GET | Bearer JWT | – | `{ coins, level, tickets, tasks:[…] }` | Snapshot for UI |
| 3 | /tap | POST | Bearer JWT | `{ taps: 1-15 }` | `{ coins, levelUp? }` | Caps taps ≤ 15 |
| 4 | /ad/reward | POST | Bearer JWT | `{ adType:"rewarded" }` | `{ ticketsAwarded }` | 1 per level-up |
| 5 | /tasks/claim | POST | Bearer JWT | `{ bundleId }` | `{ success, ticketsAwarded }` | Validates completion |
| 6 | /tasks/active | GET | Bearer JWT | – | `[ {bundleId, progress, multiplier, expiresAt} ]` | Cached 5 min |
| 7 | /leaderboard/top | GET | public | `?limit=20` | `[ {rank, username, level} ]` | Materialised view |
| 8 | /leaderboard/me | GET | Bearer JWT | – | `{ rank, level }` | Lightweight |

Request/Response Examples

/auth/tg (200)
```
{ "token": "<supabase_jwt>", "player": { "coins":0, "level":0, "tickets":0 } }
```

/tap
```
req:  { "taps": 12 }
resp: { "coins": 1234, "levelUp": { "level": 17, "tickets": 1 } }
```

/ad/reward
```
req:  { "adType": "rewarded" }
resp: { "ticketsAwarded": 20 }
```

/tasks/claim
```
req:  { "bundleId": 3 }
resp: { "success": true, "ticketsAwarded": 5 }
```

/me
```
resp: {
  "coins": 345,
  "level": 12,
  "tickets": 8,
  "tasks": [ { "bundleId": 3, "progress": 4, "total": 5, "multiplier": 0.1 } ]
}
```

/leaderboard/top
```
resp: [ { "rank": 1, "username": "Alice", "level": 42 }, { "rank": 2, "username": "Bob", "level": 39 } ]
```

Auth Rules
- `/auth/tg`: only `tma` header; no JWT.
- Others require Bearer Supabase JWT, except `/leaderboard/top` (public).
- Service-role key is used by cron/aggregation (never exposed to client).

Corner Cases
- Tap batching capped at 15.
- Ad reward double-spend prevented via Unique `(player_id, level_after)` in `ad_events`.
- Leaderboard cache: prefer materialised view refreshed every minute.


