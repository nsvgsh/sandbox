-- Telegram identities mapping table
-- Maps Telegram tg_user_id to internal user_id and stores optional profile fields

create table if not exists telegram_identities (
  tg_user_id bigint primary key,
  user_id uuid not null references user_profiles(user_id),
  first_name text,
  last_name text,
  username text,
  photo_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_telegram_identities_user on telegram_identities(user_id);

-- Ensure pgcrypto is available for gen_random_uuid() in code paths that insert users
create extension if not exists "pgcrypto";


