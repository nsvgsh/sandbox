#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

function die(msg) { console.error(msg); process.exit(1) }
function readArgs() {
  const args = process.argv.slice(2)
  const m = { in: null, out: null }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--in') m.in = args[++i]
    else if (args[i] === '--out') m.out = args[++i]
  }
  if (!m.in || !m.out) die('Usage: node web/scripts/build-game-sql.mjs --in ops/game-admin/input.json --out ops/game-admin/output.sql')
  return m
}
function isUuid(v) { return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v) }

function validateCfg(cfg) {
  const err = []
  if (typeof cfg.coins_per_tap !== 'number' || !Number.isFinite(cfg.coins_per_tap) || cfg.coins_per_tap <= 0) err.push('coins_per_tap must be positive number')
  const tp = cfg.thresholds_poly || {}
  ;['a0','a1','a2','a3'].forEach(k => { if (typeof tp[k] !== 'number') err.push(`thresholds_poly.${k} must be number`) })
  if (Array.isArray(cfg.level_rewards)) {
    for (const r of cfg.level_rewards) {
      if (typeof r.level !== 'number') err.push('level_rewards.level must be number')
      if (typeof r.payload !== 'object' || r.payload === null) err.push('level_rewards.payload must be object')
    }
  }
  if (Array.isArray(cfg.free_trial)) {
    for (const r of cfg.free_trial) {
      if (typeof r.level !== 'number') err.push('free_trial.level must be number')
      if (r.task_id && !isUuid(r.task_id)) err.push('free_trial.task_id must be uuid')
    }
  }
  const kinds = new Set(['in_app','social','free-trial'])
  const verif = new Set(['none','server','external'])
  if (Array.isArray(cfg.tasks)) {
    for (const t of cfg.tasks) {
      if (!isUuid(t.task_id)) err.push('tasks.task_id must be uuid')
      if (typeof t.unlock_level !== 'number') err.push('tasks.unlock_level must be number')
      if (!kinds.has(t.kind)) err.push('tasks.kind invalid')
      if (!verif.has(t.verification ?? 'none')) err.push('tasks.verification invalid')
      if (typeof t.reward_payload !== 'object' || t.reward_payload === null) err.push('tasks.reward_payload must be object')
    }
  }
  if (err.length) die('Invalid input:\n- ' + err.join('\n- '))
}

function sqlEscapeJsonForDo(json) {
  return JSON.stringify(json).replace(/'/g, "''")
}

function buildSQL(cfg) {
  const embedded = sqlEscapeJsonForDo(cfg)
  return `
begin;

do $$
declare
  cfg jsonb := '${embedded}'::jsonb;
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
`.trim() + '\n'
}

function main() {
  const { in: inPath, out: outPath } = readArgs()
  const raw = fs.readFileSync(path.resolve(inPath), 'utf8')
  let cfg
  try { cfg = JSON.parse(raw) } catch { die('Input is not valid JSON') }
  validateCfg(cfg)
  const sql = buildSQL(cfg)
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true })
  fs.writeFileSync(path.resolve(outPath), sql, 'utf8')
  console.log(`SQL written to ${outPath}`)
}
main()
