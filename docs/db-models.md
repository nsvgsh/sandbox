# Data Models (Narrative)

| Table | Purpose | Key Columns |
| ----- | ------- | ----------- |
| `players` | One row per Telegram user | `tg_user_id`, `coins`, `level`, `tickets` |
| `tap_events` | Raw tap batches (analytics) | `player_id`, `coins_earned` |
| `level_events` | Level-up history | `player_id`, `level_before`, `level_after` |
| `ad_events` | Rewarded-ad redemptions | `player_id`, `type`, `reward_tickets` |
| `task_bundles` | Definition of periodic task sets | `unlock_level`, `multiplier`, `expires_at` |
| `task_progress` | Junction of player ↔ bundle | composite PK (`player_id`, `bundle_id`) |
| `leaderboard_snap` | Materialised leaderboard at capture time | `player_id`, `level`, `rank` |

## Relationships
* `*_events.player_id` → `players.id` (cascade delete)
* `task_progress.player_id` → `players.id`
* `task_progress.bundle_id` → `task_bundles.id`
* `leaderboard_snap.player_id` → `players.id`

## Security Model
* **Public** role: read-only `task_bundles`, leaderboard snapshots.
* **Authenticated** (Supabase JWT): CRUD only on own rows (enforced via RLS).
* **service_role**: unrestricted access for background jobs.
* **admin**: superuser via `supabase_admin` role.

