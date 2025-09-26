#!/usr/bin/env node
// Orchestrates local Postgres reset/init/apply based on web/.env.local
// Steps:
// 1) Parse DATABASE_URL, DEV_TOKEN, NEXT_PUBLIC_DEV_TOKEN from web/.env.local
// 2) Ensure local Postgres is running (for localhost only); init cluster in ops/.pgdata if needed
// 3) Drop & recreate the target database
// 4) Apply base schema + extensions + migrations
// 5) Generate and apply ops/game-admin and ops/integrations-admin SQL

import { execSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..');

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function fail(msg, code = 1) {
  process.stderr.write(`ERROR: ${msg}\n`);
  process.exit(code);
}

function run(cmd, options = {}) {
  log(`$ ${cmd}`);
  try {
    const out = execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...(options.env || {}) } });
    return out;
  } catch (e) {
    fail(`Command failed: ${cmd}`);
  }
}

function which(bin) {
  const res = spawnSync(process.platform === 'win32' ? 'where' : 'command', [process.platform === 'win32' ? bin : '-v', ...(process.platform === 'win32' ? [] : [bin])], { stdio: 'pipe' });
  return res.status === 0;
}

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) fail(`Env file not found: ${filePath}`);
  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function parseDatabaseUrl(urlString) {
  try {
    const u = new URL(urlString);
    if (!/^postgres(|ql):$/.test(u.protocol)) throw new Error('not postgres');
    const host = u.hostname || 'localhost';
    const port = u.port ? Number(u.port) : 5432;
    const database = (u.pathname || '').replace(/^\//, '') || 'postgres';
    const user = decodeURIComponent(u.username || 'postgres');
    const password = decodeURIComponent(u.password || '');
    return { host, port, database, user, password };
  } catch (e) {
    fail(`Invalid DATABASE_URL: ${urlString}`);
  }
}

function pgIsReady({ host, port }) {
  if (!which('pg_isready')) return false;
  const res = spawnSync('pg_isready', ['-h', host, '-p', String(port)], { stdio: 'ignore' });
  return res.status === 0;
}

function ensureLocalPostgres({ host, port }) {
  if (host !== 'localhost' && host !== '127.0.0.1') {
    log(`Host is ${host}; skipping local cluster start (expected localhost).`);
    return;
  }
  const dataDir = resolve(repoRoot, 'ops/.pgdata');
  const logFile = resolve(repoRoot, 'ops/.pg.log');
  const havePgCtl = which('pg_ctl');
  const haveInitdb = which('initdb');
  if (!havePgCtl || !haveInitdb) {
    log('pg_ctl/initdb not found in PATH; assuming Postgres is provided by the system and will be started externally.');
    return;
  }
  if (!existsSync(dataDir)) {
    log(`Initializing cluster in ${relative(repoRoot, dataDir)} ...`);
    run(`initdb -D ${JSON.stringify(dataDir)} -U postgres -A trust -E UTF8`);
  }
  if (!pgIsReady({ host: 'localhost', port })) {
    log(`Starting Postgres on port ${port} ...`);
    run(`pg_ctl -D ${JSON.stringify(dataDir)} -o "-p ${port}" -l ${JSON.stringify(logFile)} start`);
    let tries = 0;
    while (!pgIsReady({ host: 'localhost', port }) && tries < 20) {
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);
      tries += 1;
    }
    if (!pgIsReady({ host: 'localhost', port })) fail('Postgres did not become ready');
  }
}

function psqlArgs({ host, port, user, database }) {
  const args = ['-v', 'ON_ERROR_STOP=1'];
  if (host) args.push('-h', host);
  if (port) args.push('-p', String(port));
  if (user) args.push('-U', user);
  if (database) args.push('-d', database);
  return args;
}

function psqlCommand(conn, sql) {
  const args = psqlArgs(conn).concat(['-c', sql]);
  const env = { ...process.env };
  if (conn.password) env.PGPASSWORD = conn.password;
  const res = spawnSync('psql', args, { stdio: 'inherit', env });
  if (res.status !== 0) fail(`psql failed: ${sql}`);
}

function psqlFile(conn, filePath) {
  const args = psqlArgs(conn).concat(['-f', filePath]);
  const env = { ...process.env };
  if (conn.password) env.PGPASSWORD = conn.password;
  const res = spawnSync('psql', args, { stdio: 'inherit', env });
  if (res.status !== 0) fail(`psql failed for file: ${filePath}`);
}

function dropAndRecreateDatabase(conn) {
  const adminConn = { ...conn, database: 'postgres' };
  const dbName = conn.database.replace(/"/g, '""');
  psqlCommand(adminConn, `select pg_terminate_backend(pid) from pg_stat_activity where datname = '${dbName}' and pid <> pg_backend_pid();`);
  psqlCommand(adminConn, `drop database if exists "${dbName}";`);
  psqlCommand(adminConn, `create database "${dbName}";`);
}

function applySchemaAndMigrations(conn) {
  const schemaFile = resolve(repoRoot, 'docs/db-schema.sql');
  if (!existsSync(schemaFile)) fail(`Schema file not found: ${relative(repoRoot, schemaFile)}`);
  psqlFile(conn, schemaFile);
  psqlCommand(conn, 'create extension if not exists "pgcrypto";');
  const migrationsDir = resolve(repoRoot, 'supabase/migrations');
  if (!existsSync(migrationsDir)) {
    log('Migrations dir not found; skipping migrations.');
    return;
  }
  const files = readdirSync(migrationsDir)
    .filter(f => /\.sql$/.test(f))
    .sort();
  for (const f of files) {
    const fp = resolve(migrationsDir, f);
    log(`Applying migration ${relative(repoRoot, fp)}`);
    psqlFile(conn, fp);
  }
}

function runGeneratorsAndApply(conn) {
  const gameIn = resolve(repoRoot, 'ops/game-admin/input.json');
  const gameOut = resolve(repoRoot, 'ops/game-admin/output.sql');
  const gameGen = resolve(repoRoot, 'web/scripts/build-game-sql.mjs');
  if (!existsSync(gameIn) || !existsSync(gameGen)) {
    log('Game admin generator or input missing; skipping game-admin apply.');
  } else {
    run(`node ${JSON.stringify(gameGen)} --in ${JSON.stringify(gameIn)} --out ${JSON.stringify(gameOut)}`);
    if (existsSync(gameOut)) psqlFile(conn, gameOut);
  }

  const integIn = resolve(repoRoot, 'ops/integrations-admin/input.json');
  const integOut = resolve(repoRoot, 'ops/integrations-admin/output.sql');
  const integGen = resolve(repoRoot, 'web/scripts/build-integrations-sql.mjs');
  if (!existsSync(integIn) || !existsSync(integGen)) {
    log('Integrations generator or input missing; skipping integrations-admin apply.');
  } else {
    run(`node ${JSON.stringify(integGen)} --in ${JSON.stringify(integIn)} --out ${JSON.stringify(integOut)}`);
    if (existsSync(integOut)) psqlFile(conn, integOut);
  }

  // Runtime config (optional)
  const rtIn = resolve(repoRoot, 'ops/runtime-config-admin/input.json');
  const rtOut = resolve(repoRoot, 'ops/runtime-config-admin/output.sql');
  const rtGen = resolve(repoRoot, 'web/scripts/build-runtime-config-sql.mjs');
  if (existsSync(rtIn) && existsSync(rtGen)) {
    run(`node ${JSON.stringify(rtGen)} --in ${JSON.stringify(rtIn)} --out ${JSON.stringify(rtOut)}`);
    if (existsSync(rtOut)) psqlFile(conn, rtOut);
  }

  return { gameOut, integOut, rtOut };
}

function safeRead(filePath) {
  try { return readFileSync(filePath, 'utf8'); } catch { return null }
}

function composeRemoteSetupSql(paths) {
  const outFile = resolve(repoRoot, 'ops/remote-setup.sql');
  const parts = [];
  parts.push('-- Remote setup SQL — generated by ops/local-db.mjs');
  // 0) Cleanup (dangerous, full reset inside the current database)
  parts.push('-- 0) Cleanup (DANGER: full reset in current database)');
  parts.push('begin;');
  parts.push("-- Drop functions if exist (safe)\nDO $$ BEGIN\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS claim_level_bonus(uuid,int,numeric)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS claim_level_bonus_v3(uuid,int,numeric,uuid,uuid)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS claim_level_bonus_v4(uuid,int,numeric,uuid,uuid)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS claim_task(uuid)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS claim_task_v2(uuid,uuid,uuid)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS apply_tap_batch(uuid,uuid,uuid,uuid,bigint,int,bigint,text)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS apply_reward_event(uuid,text,text,jsonb,numeric)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS session_start(uuid)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS _next_threshold(int)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS _threshold_for_level(int)'; EXCEPTION WHEN undefined_function THEN END;\n  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS sync_level_offer_schedule_to_tasks()'; EXCEPTION WHEN undefined_function THEN END;\nEND $$;");
  parts.push('-- Truncate tables (CASCADE)');
  parts.push('truncate table if exists \
    tap_batches, level_events, ad_events, reward_events, task_progress, \
    task_definitions, level_reward_templates, leaderboard_global, partner_postbacks, \
    active_effects, level_offer_schedule, attribution_leads, user_counters, user_profiles, \
    game_config \
  RESTART IDENTITY CASCADE;');
  parts.push('commit;');
  parts.push('-- 1) Base schema');
  const schemaFile = resolve(repoRoot, 'docs/db-schema.sql');
  const schema = safeRead(schemaFile); if (schema) parts.push(schema.trim());
  parts.push('create extension if not exists "pgcrypto";');
  parts.push('-- 2) Migrations (applied in lexical order)');
  const migrationsDir = resolve(repoRoot, 'supabase/migrations');
  try {
    const files = readdirSync(migrationsDir).filter(f => /\.sql$/.test(f)).sort();
    for (const f of files) {
      const fp = resolve(migrationsDir, f);
      const body = safeRead(fp);
      if (body) {
        parts.push(`-- migration: ${f}`);
        parts.push(body.trim());
      }
    }
  } catch {}
  parts.push('-- 3) Admin generated SQL (game/integrations/runtime)');
  const gameBody = safeRead(paths.gameOut); if (gameBody) parts.push(gameBody.trim());
  const integBody = safeRead(paths.integOut); if (integBody) parts.push(integBody.trim());
  const rtBody = safeRead(paths.rtOut); if (rtBody) parts.push(rtBody.trim());

  const combined = parts.join('\n\n');
  try {
    writeFileSync(outFile, combined, 'utf8');
    log(`Wrote combined remote SQL: ${relative(repoRoot, outFile)}`);
  } catch (e) {
    log('WARN: could not write combined remote SQL');
  }
}

function main() {
  if (!which('psql')) fail('psql not found in PATH');
  const envPath = resolve(repoRoot, 'web/.env.local');
  const env = parseEnvFile(envPath);
  const { DATABASE_URL, DEV_TOKEN, NEXT_PUBLIC_DEV_TOKEN } = env;
  if (!DATABASE_URL) fail('DATABASE_URL missing in web/.env.local');
  if (DEV_TOKEN && NEXT_PUBLIC_DEV_TOKEN && DEV_TOKEN !== NEXT_PUBLIC_DEV_TOKEN) {
    log('WARN: DEV_TOKEN and NEXT_PUBLIC_DEV_TOKEN do not match. For local auth, set them equal.');
  }

  const conn = parseDatabaseUrl(DATABASE_URL);
  ensureLocalPostgres(conn);

  if ((conn.host === 'localhost' || conn.host === '127.0.0.1') && conn.user && conn.user !== 'postgres') {
    const adminConn = { ...conn, database: 'postgres', user: 'postgres', password: '' };
    const quotedUser = conn.user.replace(/"/g, '""');
    try {
      psqlCommand(adminConn, `do $$ begin if not exists (select from pg_roles where rolname = '${quotedUser}') then create role "${quotedUser}" login password ${conn.password ? `'${conn.password.replace(/'/g, "''")}'` : 'null'}; end if; end $$;`);
    } catch (e) {
      log('WARN: could not ensure role exists (insufficient privileges). Proceeding.');
    }
  }

  dropAndRecreateDatabase(conn);
  applySchemaAndMigrations(conn);
  const genPaths = runGeneratorsAndApply(conn);
  composeRemoteSetupSql(genPaths);

  log('Local DB reset and seed complete.');
}

main();


