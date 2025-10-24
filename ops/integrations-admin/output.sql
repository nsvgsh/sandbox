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
    'free_trial_url_template','free_trial_source','free_trial_variants'
  );
  insert into game_config(key, value) values ('free_trial_url_template', '"https://himfls.com/track/Mzc2LjAuMy4zLjAuMC4wLjAuMC4wLjAuMA?_ocid={CLICKID}&aff_subid={SOURCE}"'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('free_trial_source', '"tap-app"'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('free_trial_variants', '[{"id":"v1","url_template":"https://x.trc85.com/aff_c?offer_id=2651&aff_id=4113&url_id=8834&source={SOURCE}&aff_sub={CLICKID}&pl=9","allowed_hosts":["x.trc85.com"]},{"id":"v2","url_template":"https://x.trc85.com/aff_c?offer_id=2651&aff_id=4113&url_id=10273&source={SOURCE}&aff_sub={CLICKID}&pl=42","allowed_hosts":["x.trc85.com"]},{"id":"v3","url_template":"http://x.trc85.com/aff_c?offer_id=882&aff_id=4113&url_id=8391&source={SOURCE}&aff_sub={CLICKID}&pl=54","allowed_hosts":["x.trc85.com"]},{"id":"v4","url_template":"http://x.trc85.com/aff_c?offer_id=882&aff_id=4113&url_id=15082&source={SOURCE}&aff_sub={CLICKID}&pl=192","allowed_hosts":["x.trc85.com"]}]'::jsonb)
    on conflict (key) do update set value = excluded.value;

commit;
