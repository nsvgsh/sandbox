-- Monetag SDK configuration: seed defaults for client consumption via /api/v1/config

-- Enable Monetag integration
insert into game_config(key, value)
values ('monetag_enabled', 'true')
on conflict (key) do update set value = excluded.value;

-- Zone identifier (string)
insert into game_config(key, value)
values ('monetag_zone_id', '"9667281"')
on conflict (key) do update set value = excluded.value;

-- SDK script URL (protocol-relative as provided)
insert into game_config(key, value)
values ('monetag_sdk_url', '"//munqu.com/sdk.js"')
on conflict (key) do update set value = excluded.value;

-- Advisory client policy for ad unlock handling
insert into game_config(key, value)
values ('unlock_policy', '"any"')
on conflict (key) do update set value = excluded.value;

-- Toggle for client to log failed ad attempts
insert into game_config(key, value)
values ('log_failed_ad_events', 'true')
on conflict (key) do update set value = excluded.value;


