begin;
insert into game_config(key,value) values ('ad_ttl_seconds', '10') on conflict (key) do update set value = excluded.value;
insert into game_config(key,value) values ('coins_per_tap', '100') on conflict (key) do update set value = excluded.value;
insert into game_config(key,value) values ('hud_tween_ms', '160') on conflict (key) do update set value = excluded.value;
insert into game_config(key,value) values ('thresholds','{}'::jsonb) on conflict (key) do update set value = coalesce(game_config.value,'{}'::jsonb) || jsonb_build_object('base', 10) || jsonb_build_object('growth', 'linear') || jsonb_build_object('batch_min_interval_ms', 500);
insert into game_config(key,value) values ('tap_agg','{}'::jsonb) on conflict (key) do update set value = coalesce(game_config.value,'{}'::jsonb) || jsonb_build_object('flush_threshold', 2) || jsonb_build_object('tween_ms_min', 80) || jsonb_build_object('tween_ms_max', 180);
insert into game_config(key,value) values ('ingest','{}'::jsonb) on conflict (key) do update set value = coalesce(game_config.value,'{}'::jsonb) || jsonb_build_object('max_taps_per_batch', 5) || jsonb_build_object('clamp_soft', true);
insert into game_config(key,value) values ('level_bonus_policy', jsonb_build_object('coins', 'multiply', 'tickets', 'add', 'coin_multiplier', 'multiply')) on conflict (key) do update set value = excluded.value;
commit;
