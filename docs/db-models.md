DB Models (v1)

players
- id (uuid, pk), tg_user_id (bigint, unique), username, coins (bigint), level (int), tickets (int), created_at, updated_at
- RLS: select/update only own row (id = auth.uid())

tap_events
- id (uuid, pk), player_id → players.id, coins_earned (bigint), created_at
- RLS: select/insert where player_id = auth.uid()

level_events
- id (uuid, pk), player_id → players.id, level_before (int), level_after (int), coins_spent (bigint), created_at
- Unique (player_id, level_after)
- RLS: select/insert where player_id = auth.uid()

ad_events
- id (uuid, pk), player_id → players.id, type (enum), level_after (int), reward_tickets (int), created_at
- Unique (player_id, level_after) to prevent double-spend
- RLS: select/insert where player_id = auth.uid()

task_bundles
- id (identity, pk), unlock_level (int), multiplier (numeric), expires_at (timestamptz)
- RLS: public read (anon allowed)

task_progress
- (player_id, bundle_id) composite pk; completed_at
- RLS: select/insert/update where player_id = auth.uid()

leaderboard_snap
- id (uuid, pk), player_id → players.id, level (int), rank (int), captured_at
- Access served via Edge/materialised view; table is not public by default

Relationships
- tap_events.player_id → players.id
- level_events.player_id → players.id
- ad_events.player_id → players.id
- task_progress.player_id → players.id
- task_progress.bundle_id → task_bundles.id
- leaderboard_snap.player_id → players.id


