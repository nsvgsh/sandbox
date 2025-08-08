-- v1 schema (skeleton)
-- Users
create table if not exists user_profiles (
  user_id uuid primary key,
  created_at timestamptz default now(),
  locale text,
  attribution_campaign_id text
);

create table if not exists user_counters (
  user_id uuid primary key references user_profiles(user_id),
  coins bigint default 0,
  tickets int default 0,
  coin_multiplier numeric(10,4) default 1.0,
  level int default 0,
  total_taps bigint default 0,
  session_epoch uuid,
  current_session_id uuid,
  last_applied_seq bigint default 0,
  updated_at timestamptz default now()
);

create table if not exists tap_batches (
  batch_id uuid primary key,
  user_id uuid references user_profiles(user_id),
  session_id uuid,
  client_seq bigint,
  taps int,
  coins_delta bigint,
  checksum text,
  status text check (status in ('pending','applied','dup','rejected')),
  error_code text,
  created_at timestamptz default now(),
  applied_at timestamptz
);
create index if not exists idx_tap_batches_user_created on tap_batches(user_id, created_at);
create index if not exists idx_tap_batches_user_seq on tap_batches(user_id, client_seq);

create table if not exists level_events (
  id bigserial primary key,
  user_id uuid references user_profiles(user_id),
  level int,
  base_reward bigint,
  reward_payload jsonb,
  bonus_offered bool default true,
  bonus_multiplier numeric(10,4),
  ad_event_id uuid,
  created_at timestamptz default now()
);
create index if not exists idx_level_events_user_created on level_events(user_id, created_at desc);

create table if not exists ad_events (
  id uuid primary key,
  user_id uuid references user_profiles(user_id),
  session_id uuid,
  provider text,
  placement text,
  status text check (status in ('filled','closed','failed')),
  reward_payload jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_ad_events_user_created on ad_events(user_id, created_at desc);

create table if not exists reward_events (
  id uuid primary key,
  user_id uuid references user_profiles(user_id),
  source_type text check (source_type in ('level_up','task_claim','ad_bonus','admin_grant','promo','fixup')),
  source_ref_id text,
  base_payload jsonb,
  multiplier_applied numeric(10,4),
  policy_key text,
  effective_payload jsonb,
  coins_delta bigint default 0,
  tickets_delta int default 0,
  coin_multiplier_delta numeric(10,4) default 0,
  status text check (status in ('applied','rolled_back')) default 'applied',
  idempotency_key text,
  created_at timestamptz default now()
);

create table if not exists task_definitions (
  task_id uuid primary key,
  unlock_level int,
  kind text check (kind in ('in_app','social','partner')),
  reward_payload jsonb,
  verification text check (verification in ('none','server','external')),
  active bool default true,
  created_at timestamptz default now()
);

create table if not exists task_progress (
  user_id uuid references user_profiles(user_id),
  task_id uuid references task_definitions(task_id),
  state text check (state in ('locked','available','claimed')),
  claimed_at timestamptz,
  primary key(user_id, task_id)
);

create table if not exists attribution_leads (
  user_id uuid primary key references user_profiles(user_id),
  campaign_id text,
  first_seen_at timestamptz default now(),
  meta jsonb
);

create table if not exists leaderboard_global (
  user_id uuid primary key references user_profiles(user_id),
  level int,
  updated_at timestamptz default now()
);
create index if not exists idx_leaderboard_level on leaderboard_global(level desc);

create table if not exists partner_postbacks (
  id bigserial primary key,
  user_id uuid references user_profiles(user_id),
  provider text check (provider in ('propellerads')),
  subid text,
  goal int,
  url text,
  status text check (status in ('pending','sent','failed','duplicate')) default 'pending',
  http_code int,
  response_hash text,
  attempts int default 0,
  created_at timestamptz default now(),
  sent_at timestamptz,
  unique(user_id, provider, goal)
);

create table if not exists active_effects (
  effect_id uuid primary key,
  user_id uuid references user_profiles(user_id),
  type text check (type in ('coin_multiplier')),
  magnitude numeric(10,4),
  expires_at timestamptz,
  source_reward_event_id uuid references reward_events(id),
  created_at timestamptz default now(),
  unique(user_id, type, source_reward_event_id)
);
