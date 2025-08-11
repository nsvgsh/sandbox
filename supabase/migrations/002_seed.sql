-- Seed a sample task definition
insert into task_definitions(task_id, unlock_level, kind, reward_payload, verification, active)
values (gen_random_uuid(), 1, 'in_app', '{"coins":100}'::jsonb, 'none', true)
on conflict do nothing;

-- Seed a multiplier task at level 2
insert into task_definitions(task_id, unlock_level, kind, reward_payload, verification, active)
values (gen_random_uuid(), 2, 'in_app', '{"coin_multiplier":0.1}'::jsonb, 'none', true)
on conflict do nothing;

-- Seed level reward templates (default and milestones)
insert into level_reward_templates(level, payload, active)
values
  (0, '{"tickets":3}'::jsonb, true),
  (1, '{"coins":20, "tickets":3}'::jsonb, true),
  (2, '{"coins":25}'::jsonb, true),
  (3, '{"coins":30}'::jsonb, true),
  (5, '{"coins":50, "tickets":5}'::jsonb, true),
  (10, '{"coins":120, "coin_multiplier":0.1}'::jsonb, true)
on conflict do nothing;
