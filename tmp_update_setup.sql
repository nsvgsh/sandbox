Коротко: вот один SQL-скрипт, который задаёт вашу таблицу порогов (пер-уровень), настраивает мультипликатор по уровням, и выставляет 100 монет за тап. Скрипт хранит карту порогов в game_config, обновляет хелперы и apply_tap_batch под неё, и аккуратно обновляет шаблоны наград так, чтобы добавить coin_multiplier, не затирая другие поля payload.

```sql
-- BEGIN
begin;

-- 3) Базовые монеты за один тап = 100
insert into game_config(key, value)
values ('coins_per_tap', '100'::jsonb)
on conflict (key) do update set value = excluded.value;

-- 2) Карта порогов: абсолютные монеты, при которых достигается уровень N
-- Формат: thresholds_map: { "уровень": монеты }
insert into game_config(key, value)
values (
  'thresholds_map',
  '{
    "1":1147, "2":2606, "3":4533, "4":6970, "5":9959,
    "6":13542, "7":17761, "8":22821, "9":28608, "10":35164,
    "11":42531, "12":50178, "13":59491, "14":69748
  }'::jsonb
)
on conflict (key) do update set value = excluded.value;

-- Хелпер: абсолютный порог для уровня N (fallback на линейный base, если карты нет)
create or replace function _threshold_for_level(p_level int)
returns int language sql stable as $$
  select coalesce(
    ((select value from game_config where key='thresholds_map')->>(p_level::text))::int,
    ((select (value->>'base')::int from game_config where key='thresholds') * p_level)
  )
$$;

-- Обновляем next_threshold, чтобы UI получал число из карты порогов
create or replace function _next_threshold(p_level int)
returns jsonb language sql stable as $$
  select jsonb_build_object('level', p_level + 1, 'coins', _threshold_for_level(p_level + 1))
$$;

-- 1) Маппинг уровня на мультипликатор:
-- 0 → 1.14 (старт), затем +0.07 на каждом уровне до 14 → 2.12
-- Устанавливаем дефолт и поднимаем у текущих пользователей ниже стартового
alter table user_counters alter column coin_multiplier set default 1.14;
update user_counters set coin_multiplier = 1.14 where coin_multiplier < 1.14;

-- Добавляем/обновляем coin_multiplier в активных шаблонах наград для уровней 1..14.
-- Вставка/обновление делает merge payload: сохраняет существующие coins/tickets, меняет/добавляет coin_multiplier.
-- Дельта на уровень = 0.07 (так чтобы накапливаясь дать целевой абсолют).
do $$
declare
  lvl int;
begin
  for lvl in 1..14 loop
    -- Обновить последний активный шаблон уровня (merge coin_multiplier=0.07)
    update level_reward_templates
       set payload = coalesce(payload, '{}'::jsonb) || jsonb_build_object('coin_multiplier', 0.07),
           updated_at = now()
     where level = lvl and active is true;

    -- Если активного шаблона для уровня нет — вставить минимальный
    if not found then
      insert into level_reward_templates(template_id, level, payload, active, updated_at)
      values (gen_random_uuid(), lvl, jsonb_build_object('coin_multiplier', 0.07), true, now());
    end if;
  end loop;
end$$;

-- ВНИМАНИЕ: ниже — обновление apply_tap_batch, чтобы цикл лэвел-апа использовал карту порогов.
-- Никакого списания монет (no-spend). Порог берём из _threshold_for_level(v_level+1).
create or replace function apply_tap_batch(
  p_user_id uuid,
  p_batch_id uuid,
  p_session_id uuid,
  p_session_epoch uuid,
  p_client_seq bigint,
  p_taps int,
  p_coins_delta bigint,
  p_checksum text
) returns table(
  coins bigint,
  tickets int,
  coin_multiplier numeric,
  level int,
  total_taps bigint,
  leveled_up jsonb,
  next_threshold jsonb
) language plpgsql as $$
declare
  v_counters user_counters%rowtype;
  v_prev_seq bigint;
  v_new_coins bigint;
  v_new_total_taps bigint;
  v_level int;
  v_any_leveled boolean := false;
  v_threshold int;
  v_cpt int;
  v_eff_mult numeric;
  v_earned_num numeric;
  v_earned bigint;
  v_tpl_payload jsonb;
  v_tpl_id uuid;
  v_reward_coins_total bigint := 0;
  v_reward_tickets_total int := 0;
  v_reward_coin_mult_delta numeric := 0;
  v_offer record;
begin
  if exists(select 1 from tap_batches where user_id=p_user_id and batch_id=p_batch_id) then
    select * into v_counters from user_counters where user_id=p_user_id;
    coins := v_counters.coins; tickets := v_counters.tickets; coin_multiplier := v_counters.coin_multiplier; level := v_counters.level; total_taps := v_counters.total_taps;
    leveled_up := null; next_threshold := _next_threshold(level);
    return next; return;
  end if;

  perform pg_advisory_xact_lock(hashtext(p_user_id::text));
  select * into v_counters from user_counters where user_id=p_user_id for update;
  declare v_min_ms int; begin
    select coalesce((value->>'batch_min_interval_ms')::int, 100) into v_min_ms from game_config where key='thresholds';
    if v_counters.updated_at is not null and (extract(epoch from (now() - v_counters.updated_at))*1000) < v_min_ms then
      raise exception 'RATE_LIMITED';
    end if;
  end;
  if not found then raise exception 'USER_NOT_INITIALIZED'; end if;

  if v_counters.session_epoch is distinct from p_session_epoch then raise exception 'SUPERSEDED'; end if;
  v_prev_seq := coalesce(v_counters.last_applied_seq, 0);
  if p_client_seq < v_prev_seq then raise exception 'SEQ_REWIND'; end if;

  select (value::text)::int into v_cpt from game_config where key='coins_per_tap';
  if not found or v_cpt is null then v_cpt := 1; end if;
  v_eff_mult := coalesce(v_counters.coin_multiplier, 1.0);
  v_earned_num := greatest(0, p_taps) * v_cpt * v_eff_mult;
  v_earned := floor(v_earned_num)::bigint;

  v_new_coins := coalesce(v_counters.coins,0) + v_earned;
  v_new_total_taps := coalesce(v_counters.total_taps,0) + greatest(0, p_taps);
  v_level := coalesce(v_counters.level,0);

  -- no-spend: используем абсолютный порог из карты; монеты не списываем
  v_threshold := _threshold_for_level(v_level + 1);
  while v_new_coins >= v_threshold loop
    v_level := v_level + 1;
    v_any_leveled := true;

    -- Free Trial: можно пропустить базовую награду
    select * into v_offer from level_offer_schedule s where s.level = v_level and s.active is true limit 1;
    if found and coalesce(v_offer.skip_base_reward, true) is true then
      insert into level_events(user_id, level, base_reward, reward_payload, bonus_offered, template_id)
        values (p_user_id, v_level, 0, coalesce(v_offer.payload, '{}'::jsonb), false, null);
      v_threshold := _threshold_for_level(v_level + 1);
      continue;
    end if;

    -- шаблон уровня (fallback: level=0)
    select payload, template_id into v_tpl_payload, v_tpl_id
      from (
        select payload, template_id from level_reward_templates
        where active is true and level_reward_templates.level = v_level
        order by updated_at desc
        limit 1
      ) x;
    if v_tpl_payload is null then
      select payload, template_id into v_tpl_payload, v_tpl_id
        from (
          select payload, template_id from level_reward_templates
          where active is true and level_reward_templates.level = 0
          order by updated_at desc
          limit 1
        ) y;
    end if;
    if v_tpl_payload is null then v_tpl_payload := '{"tickets":3}'::jsonb; end if;

    declare
      v_base_coins bigint := coalesce((v_tpl_payload->>'coins')::bigint, 0);
      v_base_tickets int := coalesce((v_tpl_payload->>'tickets')::int, 0);
      v_base_coin_mult numeric := coalesce((v_tpl_payload->>'coin_multiplier')::numeric, 0);
    begin
      v_reward_coins_total := v_reward_coins_total + v_base_coins;
      v_reward_tickets_total := v_reward_tickets_total + v_base_tickets;
      v_reward_coin_mult_delta := v_reward_coin_mult_delta + v_base_coin_mult;
      insert into level_events(user_id, level, base_reward, reward_payload, bonus_offered, template_id)
        values (p_user_id, v_level, v_base_coins, v_tpl_payload, true, v_tpl_id);
    end;

    v_threshold := _threshold_for_level(v_level + 1);
  end loop;

  update user_counters set coins = v_new_coins + v_reward_coins_total,
                           tickets = COALESCE(user_counters.tickets,0) + v_reward_tickets_total,
                           coin_multiplier = COALESCE(user_counters.coin_multiplier,1.0) + v_reward_coin_mult_delta,
                           total_taps = v_new_total_taps,
                           level = v_level,
                           last_applied_seq = p_client_seq,
                           updated_at = now()
  where user_id = p_user_id;

  insert into tap_batches(batch_id, user_id, session_id, client_seq, taps, coins_delta, checksum, status)
  values(p_batch_id, p_user_id, p_session_id, p_client_seq, p_taps, p_coins_delta, p_checksum, 'applied');

  coins := v_new_coins + v_reward_coins_total;
  tickets := coalesce(v_counters.tickets,0) + v_reward_tickets_total;
  coin_multiplier := coalesce(v_counters.coin_multiplier,1.0) + v_reward_coin_mult_delta;
  level := v_level;
  total_taps := v_new_total_taps;
  leveled_up := case when v_any_leveled then jsonb_build_object('level', v_level) else null end;
  insert into leaderboard_global(user_id, level, updated_at) values (p_user_id, v_level, now())
    on conflict(user_id) do update set level=excluded.level, updated_at=now();
  next_threshold := _next_threshold(level);
  return next;
end;$$;

commit;
-- END
```

Замечания:
- Мультипликатор стартовый 1.14 задан дефолтом столбца и поднят у пользователей с меньшим значением. На каждом уровне 1..14 прибавляется +0.07 через шаблоны (суммируется до ваших целевых значений).
- Порог уровня теперь берётся из `game_config.thresholds_map`. Если уровень не найден, используется линейный fallback по `thresholds.base`.
- Награды уровня (coins/tickets) сохраняются; мы делаем jsonb-merge, добавляя/обновляя только `coin_multiplier`.

Если хотите, чтобы в UI «Next Level: N coins» показывалось «оставшиеся до порога», можно изменить функцию, чтобы отдавать `coins - current_coins` — скажите, добавлю вариант.