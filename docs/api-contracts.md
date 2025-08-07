# Edge Function API Contracts

> All routes are deployed as Supabase Edge Functions. Unless marked *public*, they require a valid Supabase JWT issued by `/auth/tg`.

| Path | Method | Auth | Purpose |
| ---- | ------ | ---- | ------- |
| `/auth/tg` | POST | `initData` | Validate Telegram `initData`, return JWT |
| `/me` | GET | JWT | Player snapshot |
| `/tap` | POST | JWT | Register tap batch & auto-level |
| `/ad/reward` | POST | JWT | Grant Tickets from rewarded ad |
| `/tasks/claim` | POST | JWT | Claim finished task bundle |
| `/tasks/active` | GET | JWT | List active tasks |
| `/leaderboard/top` | GET | public | Top players snapshot |
| `/leaderboard/me` | GET | JWT | Current player rank |

## Common Headers
```
Authorization: Bearer <supabase_jwt>
Content-Type: application/json
```

## Example Schemas (abridged)
### `/tap` – Request
```json
{
  "taps": 12
}
```
Constraints: `1 ≤ taps ≤ 15`.

### `/tap` – Response
```json
{
  "coins": 12345,
  "level": 16,
  "leveledUp": true
}
```

Similar concise JSON examples should be added for each route as they are implemented.

