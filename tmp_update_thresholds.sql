update game_config set value='{"base":10, "growth":"linear", "batch_min_interval_ms": 0}'::jsonb where key='thresholds';
select key, value from game_config where key='thresholds';
