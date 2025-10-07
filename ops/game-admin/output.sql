begin;

do $$
declare
  cfg jsonb := '{"coins_per_tap":100,"thresholds_poly":{"a0":156,"a1":800,"a2":195,"a3":7.36},"level_rewards":[{"level":1,"payload":{"coins":0,"tickets":11,"coin_multiplier":1.21}},{"level":2,"payload":{"coins":0,"tickets":25,"coin_multiplier":1.28}},{"level":3,"payload":{"coins":0,"tickets":45,"coin_multiplier":1.35}},{"level":4,"payload":{"coins":0,"tickets":69,"coin_multiplier":1.42}},{"level":5,"payload":{"coins":0,"tickets":99,"coin_multiplier":1.49}},{"level":6,"payload":{"coins":0,"tickets":135,"coin_multiplier":1.56}},{"level":7,"payload":{"coins":0,"tickets":175,"coin_multiplier":1.56}},{"level":8,"payload":{"coins":0,"tickets":219,"coin_multiplier":1.63}},{"level":9,"payload":{"coins":0,"tickets":267,"coin_multiplier":1.7}},{"level":10,"payload":{"coins":0,"tickets":321,"coin_multiplier":1.77}},{"level":11,"payload":{"coins":0,"tickets":381,"coin_multiplier":1.84}},{"level":12,"payload":{"coins":0,"tickets":429,"coin_multiplier":1.91}},{"level":13,"payload":{"coins":0,"tickets":481,"coin_multiplier":1.98}},{"level":14,"payload":{"coins":0,"tickets":541,"coin_multiplier":2.05}},{"level":15,"payload":{"coins":0,"tickets":609,"coin_multiplier":2.12}}],"free_trial":[{"level":1,"active":true,"skip_base_reward":true,"payload":{}},{"level":4,"active":true,"skip_base_reward":true,"payload":{}},{"level":7,"active":true,"skip_base_reward":true,"payload":{}}],"tasks":[{"task_id":"d2902150-9357-4f8e-bb57-0921d1ee034c","unlock_level":1,"kind":"in_app","reward_payload":{"coin_multiplier":1.21,"tickets":2},"verification":"none","active":true},{"task_id":"719ce2a5-092f-4836-bc7b-64beddeb8470","unlock_level":1,"kind":"free-trial","reward_payload":{"coin_multiplier":1.23,"tickets":3},"verification":"none","active":true},{"task_id":"b2e156d1-50f6-4a0a-882e-56c25925127e","unlock_level":1,"kind":"in_app","reward_payload":{"coin_multiplier":1.21,"tickets":2},"verification":"none","active":true},{"task_id":"feeaf6d4-e80f-4ed1-9e07-4191f574b666","unlock_level":2,"kind":"in_app","reward_payload":{"coin_multiplier":1.29,"tickets":3},"verification":"none","active":true},{"task_id":"0e9b2f82-2879-4a93-a30e-bf6f9a30f564","unlock_level":3,"kind":"in_app","reward_payload":{"coin_multiplier":1.37,"tickets":4},"verification":"none","active":true},{"task_id":"aaf10783-5bf3-4d9e-8b5f-608c2ecf4358","unlock_level":4,"kind":"free-trial","reward_payload":{"coin_multiplier":1.45,"tickets":7},"verification":"none","active":true},{"task_id":"662e1f18-b655-4701-9106-d02075ca8c14","unlock_level":5,"kind":"in_app","reward_payload":{"coin_multiplier":1.53,"tickets":8},"verification":"none","active":true},{"task_id":"7c5cc354-0065-4439-9286-f6af2c9d8173","unlock_level":6,"kind":"in_app","reward_payload":{"coin_multiplier":1.61,"tickets":9},"verification":"none","active":true},{"task_id":"6864dab3-77c4-4c42-865e-644ff8cd72db","unlock_level":7,"kind":"free-trial","reward_payload":{"coin_multiplier":1.59,"tickets":12},"verification":"none","active":true},{"task_id":"34f93117-b5ea-40e5-9afc-80eb05aa3419","unlock_level":8,"kind":"in_app","reward_payload":{"coin_multiplier":1.64,"tickets":12},"verification":"none","active":true},{"task_id":"892746dc-a74b-4856-b930-f8415e3772b0","unlock_level":9,"kind":"in_app","reward_payload":{"coin_multiplier":1.72,"tickets":12},"verification":"none","active":true},{"task_id":"a4c51428-a729-46f5-acf6-2c4bf0729ebc","unlock_level":10,"kind":"in_app","reward_payload":{"coin_multiplier":1.81,"tickets":12},"verification":"none","active":true},{"task_id":"ed32bc5e-9119-4afa-bfc2-128d75254590","unlock_level":11,"kind":"in_app","reward_payload":{"coin_multiplier":1.9,"tickets":12},"verification":"none","active":true},{"task_id":"9c96b4b0-8b75-429e-9624-d3cdc322fb62","unlock_level":12,"kind":"in_app","reward_payload":{"coin_multiplier":1.99,"tickets":12},"verification":"none","active":true},{"task_id":"37db64b3-c3a2-4f8d-b165-2e9cbf83e861","unlock_level":13,"kind":"in_app","reward_payload":{"coin_multiplier":2.09,"tickets":12},"verification":"none","active":true},{"task_id":"d77d227c-f88e-4f9f-9b09-d7f4fd0998f2","unlock_level":14,"kind":"in_app","reward_payload":{"coin_multiplier":2.19,"tickets":12},"verification":"none","active":true},{"task_id":"587b3029-1f15-4e8e-ba38-e7763238834c","unlock_level":15,"kind":"in_app","reward_payload":{"coin_multiplier":2.29,"tickets":12},"verification":"none","active":true}]}'::jsonb;
  r jsonb;
  v_level int;
  v_payload jsonb;
  v_task_id uuid;
  v_active bool;
  v_skip bool;
begin
  -- 1) coins_per_tap
  insert into game_config(key, value)
  values ('coins_per_tap', to_jsonb(coalesce((cfg->>'coins_per_tap')::int, 1)))
  on conflict (key) do update set value = excluded.value;

  -- 3) thresholds polynomial coefficients
  insert into game_config(key, value)
  values ('thresholds_poly', coalesce(cfg->'thresholds_poly', jsonb_build_object('a0',156,'a1',800,'a2',195,'a3',7.36)))
  on conflict (key) do update set value = excluded.value;

  -- Replacement semantics: purge stale data before (re)inserting
  -- Remove level templates not present in new config
  delete from level_reward_templates lrt
   where not exists (
     select 1 from jsonb_array_elements(coalesce(cfg->'level_rewards','[]'::jsonb)) rr
      where (rr->>'level')::int = lrt.level);
  -- Remove all Free Trial schedule; reinsert from config
  delete from level_offer_schedule where partner_key = 'free_trial';
  -- Remove tasks not present in new config
  delete from task_definitions t
   where not exists (
     select 1 from jsonb_array_elements(coalesce(cfg->'tasks','[]'::jsonb)) tt
      where (tt->>'task_id')::uuid = t.task_id);

  -- 2) level rewards
  for r in select * from jsonb_array_elements(coalesce(cfg->'level_rewards','[]'::jsonb)) loop
    v_level := coalesce((r->>'level')::int, null);
    v_payload := coalesce(r->'payload','{}'::jsonb);
    if v_level is null then continue; end if;

    update level_reward_templates
       set payload = v_payload, active = true, updated_at = now()
     where level = v_level and active is true;
    if not found then
      insert into level_reward_templates(template_id, level, payload, active, updated_at)
      values (gen_random_uuid(), v_level, v_payload, true, now());
    end if;
  end loop;

  -- 4) free trial schedule
  for r in select * from jsonb_array_elements(coalesce(cfg->'free_trial','[]'::jsonb)) loop
    v_level := (r->>'level')::int;
    v_active := coalesce((r->>'active')::boolean, true);
    v_skip := coalesce((r->>'skip_base_reward')::boolean, true);
    v_payload := coalesce(r->'payload','{}'::jsonb);
    v_task_id := coalesce((r->>'task_id')::uuid, gen_random_uuid());

    insert into level_offer_schedule(level, active, skip_base_reward, partner_key, payload, task_id, updated_at)
    values (v_level, v_active, v_skip, 'free_trial', v_payload, v_task_id, now())
    on conflict (level) do update
      set active = excluded.active,
          skip_base_reward = excluded.skip_base_reward,
          partner_key = 'free_trial',
          payload = excluded.payload,
          task_id = excluded.task_id,
          updated_at = now();
  end loop;

  -- Sync of free_trial schedule into tasks is disabled by product decision.

  -- 5) tasks
  for r in select * from jsonb_array_elements(coalesce(cfg->'tasks','[]'::jsonb)) loop
    v_task_id := coalesce((r->>'task_id')::uuid, gen_random_uuid());
    insert into task_definitions(task_id, unlock_level, kind, reward_payload, verification, active, created_at)
    values (v_task_id,
            (r->>'unlock_level')::int,
            (r->>'kind')::text,
            coalesce(r->'reward_payload','{}'::jsonb),
            coalesce((r->>'verification')::text,'none'),
            coalesce((r->>'active')::boolean, true),
            now())
    on conflict (task_id) do update
      set unlock_level   = excluded.unlock_level,
          kind           = excluded.kind,
          reward_payload = excluded.reward_payload,
          verification   = excluded.verification,
          active         = excluded.active;
  end loop;
end$$;

commit;
