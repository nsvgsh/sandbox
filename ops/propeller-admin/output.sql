begin;

-- PropellerAds (replacement semantics for keys)
delete from game_config where key in ('propeller_enabled','propeller_postback_base_url','propeller_aid','propeller_tid','propeller_pid');
insert into game_config(key, value) values ('propeller_enabled', 'true'::jsonb) on conflict (key) do update set value = excluded.value;
insert into game_config(key, value) values ('propeller_postback_base_url', '"http://ad.propellerads.com/conversion.php"'::jsonb) on conflict (key) do update set value = excluded.value;
insert into game_config(key, value) values ('propeller_aid', '"3857131"'::jsonb) on conflict (key) do update set value = excluded.value;
insert into game_config(key, value) values ('propeller_tid', '"145944"'::jsonb) on conflict (key) do update set value = excluded.value;
insert into game_config(key, value) values ('propeller_pid', '""'::jsonb) on conflict (key) do update set value = excluded.value;

commit;
