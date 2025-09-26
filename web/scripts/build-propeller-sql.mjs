#!/usr/bin/env node
// Generates SQL to upsert PropellerAds config in game_config

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

function fail(msg) {
  process.stderr.write(`ERROR: ${msg}\n`)
  process.exit(1)
}

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { in: null, out: null }
  for (let i = 0; i < args.length; i += 2) {
    const k = args[i]
    const v = args[i + 1]
    if (!v) fail('Missing value for arg ' + k)
    if (k === '--in') out.in = v
    else if (k === '--out') out.out = v
    else fail('Unknown arg ' + k)
  }
  if (!out.in || !out.out) fail('Usage: build-propeller-sql.mjs --in <input.json> --out <output.sql>')
  return out
}

function json(v) {
  return JSON.stringify(v)
}

function main() {
  const { in: inPath, out: outPath } = parseArgs()
  let cfg
  try {
    cfg = JSON.parse(readFileSync(resolve(inPath), 'utf8'))
  } catch (e) {
    fail('Cannot read input json: ' + e.message)
  }

  const enabled = Boolean(cfg.enabled)
  const baseUrl = String(cfg.base_url || 'http://ad.propellerads.com/conversion.php')
  const aid = String(cfg.aid || '')
  const tid = String(cfg.tid || '')
  const pid = String(cfg.pid || '')

  const sql = [
    'begin;',
    '',
    '-- PropellerAds (replacement semantics for keys)',
    `delete from game_config where key in ('propeller_enabled','propeller_postback_base_url','propeller_aid','propeller_tid','propeller_pid');`,
    `insert into game_config(key, value) values ('propeller_enabled', ${enabled ? "'true'::jsonb" : "'false'::jsonb"}) on conflict (key) do update set value = excluded.value;`,
    `insert into game_config(key, value) values ('propeller_postback_base_url', '${json(baseUrl)}'::jsonb) on conflict (key) do update set value = excluded.value;`,
    `insert into game_config(key, value) values ('propeller_aid', '${json(aid)}'::jsonb) on conflict (key) do update set value = excluded.value;`,
    `insert into game_config(key, value) values ('propeller_tid', '${json(tid)}'::jsonb) on conflict (key) do update set value = excluded.value;`,
    `insert into game_config(key, value) values ('propeller_pid', '${json(pid)}'::jsonb) on conflict (key) do update set value = excluded.value;`,
    '',
    'commit;',
    '',
  ].join('\n')

  try {
    writeFileSync(resolve(outPath), sql, 'utf8')
  } catch (e) {
    fail('Cannot write output sql: ' + e.message)
  }
}

main()
