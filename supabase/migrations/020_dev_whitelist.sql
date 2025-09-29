-- Dev whitelist for allowing privileged dev login

create table if not exists dev_whitelist (
  tg_user_id bigint primary key,
  notes text,
  created_at timestamptz default now()
);


