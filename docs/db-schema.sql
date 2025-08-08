-- Minimal declarative schema for v1
-- Assumes Postgres (Supabase). Keep concise; migrations will refine.

create extension if not exists pgcrypto;

do $$ begin
  create type ad_event_type as enum ('rewarded');
exception when duplicate_object then null; end $$;

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  tg_user_id bigint unique not null,
  username text,
  coins bigint not null default 0,
  level integer not null default 0,
  tickets integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tap_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  coins_earned bigint not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_tap_events_player_created on tap_events(player_id, created_at desc);

create table if not exists level_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  level_before integer not null,
  level_after integer not null,
  coins_spent bigint not null,
  created_at timestamptz not null default now()
);
create unique index if not exists uq_level_events_player_after on level_events(player_id, level_after);

create table if not exists ad_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  type ad_event_type not null,
  level_after integer not null,
  reward_tickets integer not null,
  created_at timestamptz not null default now(),
  unique (player_id, level_after)
);

create table if not exists task_bundles (
  id bigint generated always as identity primary key,
  unlock_level integer not null,
  multiplier numeric(6,4) not null default 0,
  expires_at timestamptz
);

create table if not exists task_progress (
  player_id uuid not null references players(id) on delete cascade,
  bundle_id bigint not null references task_bundles(id) on delete cascade,
  completed_at timestamptz,
  primary key (player_id, bundle_id)
);

create table if not exists leaderboard_snap (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id) on delete cascade,
  level integer not null,
  rank integer not null,
  captured_at timestamptz not null default now()
);
create index if not exists idx_leaderboard_captured on leaderboard_snap(captured_at desc);

-- RLS policies (concise)
alter table players enable row level security;
alter table tap_events enable row level security;
alter table level_events enable row level security;
alter table ad_events enable row level security;
alter table task_bundles enable row level security;
alter table task_progress enable row level security;
alter table leaderboard_snap enable row level security;

-- players: user can see/update own row (JWT sub = players.id)
do $$ begin
  create policy players_self_select on players for select using (id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy players_self_update on players for update using (id = auth.uid());
exception when duplicate_object then null; end $$;

-- event tables: user can select/insert own records
do $$ begin
  create policy tap_events_rw on tap_events for all using (player_id = auth.uid()) with check (player_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy level_events_rw on level_events for all using (player_id = auth.uid()) with check (player_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy ad_events_rw on ad_events for all using (player_id = auth.uid()) with check (player_id = auth.uid());
exception when duplicate_object then null; end $$;

-- task_bundles: anon/public read; progress: owner-only
do $$ begin
  create policy task_bundles_public_read on task_bundles for select using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy task_progress_rw on task_progress for all using (player_id = auth.uid()) with check (player_id = auth.uid());
exception when duplicate_object then null; end $$;

-- leaderboard_snap: no public access by default (served via materialised view/edge)


