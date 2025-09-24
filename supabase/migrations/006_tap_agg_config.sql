-- Tap aggregation config: always-on, DB-backed parameters

-- Ensure thresholds has batch_min_interval_ms while preserving base/growth
insert into game_config(key, value)
values ('thresholds', jsonb_build_object('base', 10, 'growth', 'linear', 'batch_min_interval_ms', 500))
on conflict (key) do update set
  value = coalesce(game_config.value, '{}'::jsonb)
        || jsonb_build_object('base', coalesce((game_config.value->>'base')::int, 10))
        || jsonb_build_object('growth', coalesce((game_config.value->>'growth')::text, 'linear'))
        || jsonb_build_object('batch_min_interval_ms', coalesce((game_config.value->>'batch_min_interval_ms')::int, 500));

-- Ensure ingest limits exist
insert into game_config(key, value)
values ('ingest', jsonb_build_object('max_taps_per_batch', 50, 'clamp_soft', true))
on conflict (key) do update set
  value = coalesce(game_config.value, '{}'::jsonb)
        || jsonb_build_object('max_taps_per_batch', coalesce((game_config.value->>'max_taps_per_batch')::int, 50))
        || jsonb_build_object('clamp_soft', coalesce((game_config.value->>'clamp_soft')::boolean, true));

-- Client-side aggregator tuning exposed via /config
insert into game_config(key, value)
values ('tap_agg', jsonb_build_object('flush_threshold', 20, 'tween_ms_min', 80, 'tween_ms_max', 180))
on conflict (key) do update set
  value = coalesce(game_config.value, '{}'::jsonb)
        || jsonb_build_object('flush_threshold', coalesce((game_config.value->>'flush_threshold')::int, 20))
        || jsonb_build_object('tween_ms_min', coalesce((game_config.value->>'tween_ms_min')::int, 80))
        || jsonb_build_object('tween_ms_max', coalesce((game_config.value->>'tween_ms_max')::int, 180));


