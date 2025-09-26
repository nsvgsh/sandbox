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
  if (!m.in || !m.out) die('Usage: node web/scripts/build-runtime-config-sql.mjs --in ops/runtime-config-admin/input.json --out ops/runtime-config-admin/output.sql')
  return m
}

function validate(cfg) {
  const err = []
  if (cfg.ad_ttl_seconds != null && !Number.isFinite(Number(cfg.ad_ttl_seconds))) err.push('ad_ttl_seconds must be number')
  if (cfg.coins_per_tap != null && !Number.isFinite(Number(cfg.coins_per_tap))) err.push('coins_per_tap must be number')
  if (cfg.hud_tween_ms != null && !Number.isFinite(Number(cfg.hud_tween_ms))) err.push('hud_tween_ms must be number')
  if (cfg.thresholds && typeof cfg.thresholds !== 'object') err.push('thresholds must be object')
  if (cfg.tap_agg && typeof cfg.tap_agg !== 'object') err.push('tap_agg must be object')
  if (cfg.ingest && typeof cfg.ingest !== 'object') err.push('ingest must be object')
  if (cfg.level_bonus_policy && typeof cfg.level_bonus_policy !== 'object') err.push('level_bonus_policy must be object')
  if (err.length) die('Invalid input:\n- ' + err.join('\n- '))
}

function b(s) { return typeof s === 'string' ? `'${s.replace(/'/g, "''")}'` : (s == null ? 'null' : String(s)) }

function buildSQL(cfg) {
  const lines = []
  lines.push('begin;')

  if (cfg.ad_ttl_seconds != null) {
    lines.push(`insert into game_config(key,value) values ('ad_ttl_seconds', '${Number(cfg.ad_ttl_seconds)}') on conflict (key) do update set value = excluded.value;`)
  }
  if (cfg.coins_per_tap != null) {
    lines.push(`insert into game_config(key,value) values ('coins_per_tap', '${Number(cfg.coins_per_tap)}') on conflict (key) do update set value = excluded.value;`)
  }
  if (cfg.hud_tween_ms != null) {
    lines.push(`insert into game_config(key,value) values ('hud_tween_ms', '${Number(cfg.hud_tween_ms)}') on conflict (key) do update set value = excluded.value;`)
  }
  if (cfg.thresholds && typeof cfg.thresholds === 'object') {
    const t = cfg.thresholds
    const base = 'base' in t ? Number(t.base) : null
    const growth = 'growth' in t ? String(t.growth) : null
    const batch = 'batch_min_interval_ms' in t ? Number(t.batch_min_interval_ms) : null
    const parts = []
    if (base != null) parts.push(`jsonb_build_object('base', ${base})`)
    if (growth != null) parts.push(`jsonb_build_object('growth', ${b(growth)})`)
    if (batch != null) parts.push(`jsonb_build_object('batch_min_interval_ms', ${batch})`)
    if (parts.length) {
      lines.push(`insert into game_config(key,value) values ('thresholds','{}'::jsonb) on conflict (key) do update set value = coalesce(game_config.value,'{}'::jsonb) || ${parts.join(' || ')};`)
    }
  }
  if (cfg.tap_agg && typeof cfg.tap_agg === 'object') {
    const t = cfg.tap_agg
    const flush = 'flush_threshold' in t ? Number(t.flush_threshold) : null
    const min = 'tween_ms_min' in t ? Number(t.tween_ms_min) : null
    const max = 'tween_ms_max' in t ? Number(t.tween_ms_max) : null
    const parts = []
    if (flush != null) parts.push(`jsonb_build_object('flush_threshold', ${flush})`)
    if (min != null) parts.push(`jsonb_build_object('tween_ms_min', ${min})`)
    if (max != null) parts.push(`jsonb_build_object('tween_ms_max', ${max})`)
    if (parts.length) {
      lines.push(`insert into game_config(key,value) values ('tap_agg','{}'::jsonb) on conflict (key) do update set value = coalesce(game_config.value,'{}'::jsonb) || ${parts.join(' || ')};`)
    }
  }
  if (cfg.ingest && typeof cfg.ingest === 'object') {
    const t = cfg.ingest
    const m = 'max_taps_per_batch' in t ? Number(t.max_taps_per_batch) : null
    const clamp = 'clamp_soft' in t ? (t.clamp_soft ? 'true' : 'false') : null
    const parts = []
    if (m != null) parts.push(`jsonb_build_object('max_taps_per_batch', ${m})`)
    if (clamp != null) parts.push(`jsonb_build_object('clamp_soft', ${clamp})`)
    if (parts.length) {
      lines.push(`insert into game_config(key,value) values ('ingest','{}'::jsonb) on conflict (key) do update set value = coalesce(game_config.value,'{}'::jsonb) || ${parts.join(' || ')};`)
    }
  }
  if (cfg.level_bonus_policy && typeof cfg.level_bonus_policy === 'object') {
    const p = cfg.level_bonus_policy
    const coins = typeof p.coins === 'string' ? p.coins : 'multiply'
    const tickets = typeof p.tickets === 'string' ? p.tickets : 'add'
    const cm = typeof p.coin_multiplier === 'string' ? p.coin_multiplier : 'multiply'
    lines.push(`insert into game_config(key,value) values ('level_bonus_policy', jsonb_build_object('coins', ${b(coins)}, 'tickets', ${b(tickets)}, 'coin_multiplier', ${b(cm)})) on conflict (key) do update set value = excluded.value;`)
  }

  lines.push('commit;')
  return lines.join('\n') + '\n'
}

function main() {
  const { in: inPath, out: outPath } = readArgs()
  const raw = fs.readFileSync(path.resolve(inPath), 'utf8')
  let cfg
  try { cfg = JSON.parse(raw) } catch { die('Input is not valid JSON') }
  validate(cfg)
  const sql = buildSQL(cfg)
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true })
  fs.writeFileSync(path.resolve(outPath), sql, 'utf8')
  console.log(`SQL written to ${outPath}`)
}
main()


