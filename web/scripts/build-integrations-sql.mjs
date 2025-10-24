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
  if (!m.in || !m.out) die('Usage: node web/scripts/build-integrations-sql.mjs --in ops/integrations-admin/input.json --out ops/integrations-admin/output.sql')
  return m
}

function validateCfg(cfg) {
  const err = []
  if (cfg.monetag) {
    const m = cfg.monetag
    if (typeof m.enabled !== 'boolean') err.push('monetag.enabled must be boolean')
    if (typeof m.zone_id !== 'string' || !m.zone_id) err.push('monetag.zone_id must be non-empty string')
    if (typeof m.sdk_url !== 'string' || !m.sdk_url) err.push('monetag.sdk_url must be non-empty string')
    if (m.unlock_policy && !['any','valued'].includes(m.unlock_policy)) err.push('monetag.unlock_policy must be any|valued')
    if (m.log_failed_ad_events != null && typeof m.log_failed_ad_events !== 'boolean') err.push('monetag.log_failed_ad_events must be boolean')
  }
  if (cfg.free_trial) {
    const f = cfg.free_trial
    if (typeof f.url_template !== 'string' || !f.url_template) err.push('free_trial.url_template must be non-empty string')
    if (typeof f.source !== 'string' || !f.source) err.push('free_trial.source must be non-empty string')
  }
  if (cfg.free_trial_variants) {
    if (!Array.isArray(cfg.free_trial_variants)) err.push('free_trial_variants must be an array')
    for (const v of cfg.free_trial_variants) {
      if (!v || typeof v !== 'object') { err.push('free_trial_variants entries must be objects'); break }
      if (typeof v.id !== 'string' || !v.id) { err.push('free_trial_variants[].id must be non-empty string'); break }
      if (typeof v.url_template !== 'string' || !v.url_template) { err.push(`free_trial_variants[${v.id}].url_template must be non-empty string`); break }
      if (!Array.isArray(v.allowed_hosts) || v.allowed_hosts.some((h) => typeof h !== 'string' || !h)) { err.push(`free_trial_variants[${v.id}].allowed_hosts must be non-empty string[]`); break }
      if (v.source != null && typeof v.source !== 'string') { err.push(`free_trial_variants[${v.id}].source must be string when provided`); break }
    }
  }
  if (err.length) die('Invalid input:\n- ' + err.join('\n- '))
}

function sqlForMonetag(m) {
  if (!m) return ''
  const enabled = m.enabled === true ? 'true' : 'false'
  const zone = JSON.stringify(m.zone_id)
  const sdk = JSON.stringify(m.sdk_url)
  const policy = JSON.stringify(m.unlock_policy || 'any')
  const logFail = m.log_failed_ad_events === false ? 'false' : 'true'
  return `
  -- Monetag (replacement semantics)
  delete from game_config where key in (
    'monetag_enabled','monetag_zone_id','monetag_sdk_url','unlock_policy','log_failed_ad_events'
  );
  insert into game_config(key, value) values ('monetag_enabled', '${enabled}'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('monetag_zone_id', '${zone}'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('monetag_sdk_url', '${sdk}'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('unlock_policy', '${policy}'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('log_failed_ad_events', '${logFail}'::jsonb)
    on conflict (key) do update set value = excluded.value;
`.trim()
}

function sqlForFreeTrial(f) {
  if (!f) return ''
  const tmpl = JSON.stringify(f.url_template)
  const src = JSON.stringify(f.source)
  return `
  -- Free Trial (replacement semantics)
  delete from game_config where key in (
    'free_trial_url_template','free_trial_source','free_trial_variants'
  );
  insert into game_config(key, value) values ('free_trial_url_template', '${tmpl}'::jsonb)
    on conflict (key) do update set value = excluded.value;
  insert into game_config(key, value) values ('free_trial_source', '${src}'::jsonb)
    on conflict (key) do update set value = excluded.value;
  ${Array.isArray(globalThis.__ft_variants_sql_inject__) ? globalThis.__ft_variants_sql_inject__.join('\n') : ''}
`.trim()
}

function buildSQL(cfg) {
  const parts = []
  const monetagSQL = sqlForMonetag(cfg.monetag)
  if (monetagSQL) parts.push(monetagSQL)
  // Prepare free_trial variants SQL injection into sqlForFreeTrial body
  if (Array.isArray(cfg.free_trial_variants)) {
    const arr = JSON.stringify(cfg.free_trial_variants)
    globalThis.__ft_variants_sql_inject__ = [
      `insert into game_config(key, value) values ('free_trial_variants', '${arr.replace(/'/g, "''")}'::jsonb)\n    on conflict (key) do update set value = excluded.value;`
    ]
  } else {
    globalThis.__ft_variants_sql_inject__ = []
  }
  const ftSQL = sqlForFreeTrial(cfg.free_trial)
  if (ftSQL) parts.push(ftSQL)
  const body = parts.filter(Boolean).join('\n\n')
  return `begin;\n\n${body}\n\ncommit;\n`
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
