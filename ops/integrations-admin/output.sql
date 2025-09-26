begin;

-- Monetag (replacement semantics)
  delete from game_config where key in (
    'monetag_enabled','monetag_zone_id','monetag_sdk_url','unlock_policy','log_failed_ad_events'
  );
  insert into game_config(key, value) values ('monetag_enabled', 'true'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('monetag_zone_id', '"9667281"'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('monetag_sdk_url', '"//munqu.com/sdk.js"'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('unlock_policy', '"any"'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('log_failed_ad_events', 'true'::jsonb)
    on conflict (key) do update set value = excluded.value;

-- Free Trial (replacement semantics)
  delete from game_config where key in (
    'free_trial_url_template','free_trial_source'
  );
  insert into game_config(key, value) values ('free_trial_url_template', '"https://himfls.com/track/Mzc2LjAuMy4zLjAuMC4wLjAuMC4wLjAuMA?_ocid={CLICKID}&aff_subid={SOURCE}"'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('free_trial_source', '"tap-app"'::jsonb)
    on conflict (key) do update set value = excluded.value;

commit;
