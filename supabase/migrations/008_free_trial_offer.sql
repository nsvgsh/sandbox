-- Free Trial offer schedule and config

-- Table: level_offer_schedule
create table if not exists level_offer_schedule (
  level int primary key,
  active bool default true,
  skip_base_reward bool default true,
  partner_key text default 'free_trial',
  payload jsonb,
  updated_at timestamptz default now(),
  task_id uuid not null unique
);

-- Config keys for redirect
insert into game_config(key, value) values
  ('free_trial_url_template', '"https://himfls.com/track/Mzc2LjAuMy4zLjAuMC4wLjAuMC4wLjAuMA?_ocid={CLICKID}&aff_subid={SOURCE}"'),
  ('free_trial_source', '"tap-app"')
on conflict (key) do nothing;

-- Helpful index for ad_events intent lookups
create index if not exists idx_ad_events_user_intent on ad_events (user_id, status, ((reward_payload->>'intent')));

-- Helper: sync schedule rows into task_definitions
create or replace function sync_level_offer_schedule_to_tasks()
returns void language plpgsql as $$
declare
  r record;
begin
  for r in select * from level_offer_schedule loop
    -- upsert corresponding task_definitions row
    insert into task_definitions(task_id, unlock_level, kind, reward_payload, verification, active)
    values (r.task_id, r.level, 'partner', coalesce(r.payload, '{}'::jsonb), 'external', coalesce(r.active, true))
    on conflict (task_id) do update
      set unlock_level = excluded.unlock_level,
          kind = excluded.kind,
          reward_payload = excluded.reward_payload,
          verification = excluded.verification,
          active = excluded.active;
  end loop;
end;$$;

-- Optional seed example rows (comment out in prod if not desired)
-- insert into level_offer_schedule(level, active, skip_base_reward, partner_key, payload, task_id)
-- values (3, true, true, 'free_trial', '{"debugOutline":"#7B61FF"}'::jsonb, gen_random_uuid())
-- on conflict (level) do nothing;


