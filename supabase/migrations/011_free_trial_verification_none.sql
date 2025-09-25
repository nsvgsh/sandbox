-- Set verification='none' for partner tasks (Free Trial) and update sync helper accordingly

create or replace function sync_level_offer_schedule_to_tasks()
returns void language plpgsql as $$
declare
  r record;
begin
  for r in select * from level_offer_schedule loop
    insert into task_definitions(task_id, unlock_level, kind, reward_payload, verification, active)
    values (r.task_id, r.level, 'partner', coalesce(r.payload, '{}'::jsonb), 'none', coalesce(r.active, true))
    on conflict (task_id) do update
      set unlock_level = excluded.unlock_level,
          kind = excluded.kind,
          reward_payload = excluded.reward_payload,
          verification = 'none',
          active = excluded.active;
  end loop;
end;$$;

-- Backfill any existing partner tasks to verification='none'
update task_definitions
set verification = 'none'
where kind = 'partner' and verification <> 'none';


