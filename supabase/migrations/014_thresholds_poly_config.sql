-- Config-driven polynomial thresholds (no-spend)
-- coins_required(L) = floor(a0 + a1*L + a2*L^2 + a3*L^3)
-- Coefficients are read from game_config('thresholds_poly') JSON:
-- { "a0": 156, "a1": 800, "a2": 195, "a3": 7.36 }
-- Defaults are as above if key or fields are missing.

create or replace function _threshold_for_level(p_level int)
returns bigint language sql stable as $$
  select floor(
    coalesce(((select value from game_config where key='thresholds_poly') ->> 'a0')::numeric, 156)
    + coalesce(((select value from game_config where key='thresholds_poly') ->> 'a1')::numeric, 800) * (p_level::numeric)
    + coalesce(((select value from game_config where key='thresholds_poly') ->> 'a2')::numeric, 195) * power(p_level::numeric, 2)
    + coalesce(((select value from game_config where key='thresholds_poly') ->> 'a3')::numeric, 7.36) * power(p_level::numeric, 3)
  )::bigint
$$;

-- _next_threshold remains the same interface, now using config-driven helper
create or replace function _next_threshold(p_level int)
returns jsonb language sql stable as $$
  select jsonb_build_object('level', p_level + 1, 'coins', _threshold_for_level(p_level + 1))
$$;


