-- Database schema for TapStarrr v1
-- Executable in Supabase SQL editor

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  tg_user_id bigint not null unique,
  coins bigint not null default 0,
  level integer not null default 1,
  tickets integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists tap_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  coins_earned integer not null,
  created_at timestamptz default now()
);

create table if not exists level_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  level_before integer not null,
  level_after integer not null,
  coins_spent integer not null,
  created_at timestamptz default now()
);

create table if not exists ad_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  type text not null check (type in ('rewarded')),
  reward_tickets integer not null default 0,
  created_at timestamptz default now(),
  constraint ad_unique_once_per_reward unique (player_id, type, created_at)
);

create table if not exists task_bundles (
  id uuid primary key default gen_random_uuid(),
  unlock_level integer not null,
  multiplier numeric(4,2) not null default 1.0,
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists task_progress (
  player_id uuid references players(id) on delete cascade,
  bundle_id uuid references task_bundles(id) on delete cascade,
  completed_at timestamptz,
  primary key (player_id, bundle_id)
);

create table if not exists leaderboard_snap (
  id uuid primary key default gen_random_uuid(),
  player_id uuid references players(id) on delete cascade,
  level integer not null,
  rank integer not null,
  captured_at timestamptz default now()
);

-- Row Level Security policies
alter table players enable row level security;
alter table tap_events enable row level security;
alter table level_events enable row level security;
alter table ad_events enable row level security;
alter table task_progress enable row level security;
alter table leaderboard_snap enable row level security;

create policy "Players: owners" on players
  for all using (auth.uid() = id);

create policy "Events: owners" on tap_events
  for all using (auth.uid() = player_id);
-- Repeat similarly for other *_events tables as needed.

