#!/usr/bin/env node
// Generate a Supabase SQL Editor–ready dump:
// - Uses pg_dump --inserts --rows-per-insert
// - Removes psql meta-lines (\restrict/\unrestrict)
// - Prepends cleanup section that drops recreated objects (schema-qualified)

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..', '..');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
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

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { db: process.env.DATABASE_URL || '', out: '' };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--db') out.db = args[++i];
    else if (a === '--out') out.out = args[++i];
  }
  // Fallback to web/.env.local if not provided
  if (!out.db) {
    const envPath = resolve(repoRoot, 'web/.env.local');
    const env = parseEnvFile(envPath);
    if (env.DATABASE_URL) out.db = env.DATABASE_URL;
  }
  if (!out.db) {
    console.error('ERROR: DATABASE_URL not provided. Use --db, set env DATABASE_URL, or define it in web/.env.local');
    process.exit(1);
  }
  if (!out.out) {
    const ts = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    out.out = `ops/db-dumps/dumps/dump_${ts}.supabase.sql`;
  }
  return out;
}

function findPgDump() {
  const candidates = [
    '/opt/homebrew/opt/libpq/bin/pg_dump',
    '/opt/homebrew/opt/postgresql@16/bin/pg_dump',
    '/opt/homebrew/opt/postgresql@17/bin/pg_dump',
    '/usr/local/opt/libpq/bin/pg_dump',
    '/usr/local/opt/postgresql@16/bin/pg_dump',
    '/Applications/Postgres.app/Contents/Versions/latest/bin/pg_dump',
    'pg_dump',
  ];
  for (const c of candidates) {
    try {
      const v = execFileSync(c, ['--version'], { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString();
      if (/pg_dump\s+\(PostgreSQL\)\s+(\d+)/.test(v)) return c;
    } catch {}
  }
  console.error('ERROR: pg_dump not found. Install libpq or Postgres.app');
  process.exit(1);
}

function runPgDump(pgDump, dbUrl) {
  const args = [
    `--dbname=${dbUrl}`,
    '--inserts',
    '--rows-per-insert=500',
    '--no-owner',
    '--no-privileges',
    '--format=plain',
  ];
  const buf = execFileSync(pgDump, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  return buf.toString('utf8');
}

function sanitizeDump(text) {
  // remove psql meta \restrict/\unrestrict lines if any
  return text.replace(/^\\restrict .*$/gm, '').replace(/^\\unrestrict .*$/gm, '');
}

function extractObjects(text) {
  const functions = [];
  const tables = new Set();
  const sequences = new Set();

  // Functions: capture fully qualified signature used by pg_dump header lines
  // Example header precedes function body:
  // -- Name: claim_level_bonus(uuid, integer, numeric, uuid); Type: FUNCTION; Schema: public; Owner: -
  const fnHeaderRe = /^--\s+Name:\s+([^;]+);\s+Type:\s+FUNCTION;\s+Schema:\s+([^;]+);/gm;
  let m;
  while ((m = fnHeaderRe.exec(text)) != null) {
    const nameAndArgs = m[1].trim(); // may already contain schema-qualified name in body; header gives simple name
    const schema = m[2].trim();
    // Normalize to public.name(args) with explicit schema
    const sig = `${schema}.${nameAndArgs}`;
    functions.push(sig);
  }

  // Tables
  const tblHeaderRe = /^--\s+Name:\s+([^;]+);\s+Type:\s+TABLE;\s+Schema:\s+([^;]+);/gm;
  while ((m = tblHeaderRe.exec(text)) != null) {
    const name = m[1].trim();
    const schema = m[2].trim();
    tables.add(`${schema}.${name}`);
  }

  // Sequences
  const seqHeaderRe = /^--\s+Name:\s+([^;]+);\s+Type:\s+SEQUENCE;\s+Schema:\s+([^;]+);/gm;
  while ((m = seqHeaderRe.exec(text)) != null) {
    const name = m[1].trim();
    const schema = m[2].trim();
    sequences.add(`${schema}.${name}`);
  }

  return { functions: Array.from(new Set(functions)), tables: Array.from(tables), sequences: Array.from(sequences) };
}

function buildCleanup({ functions, tables, sequences }) {
  const lines = [];
  lines.push('-- Cleanup — drop objects that will be recreated by this dump');
  lines.push('begin;');
  // drop functions with exact signatures
  lines.push('DO $$ BEGIN');
  for (const fn of functions) {
    // fn like public.claim_level_bonus(uuid, integer, numeric, uuid)
    // Quote schema.name; keep args as-is
    const name = fn.replace(/^(\w+)\.(\w+)\((.*)\)$/,
      (_, schema, fname, args) => `"${schema}"."${fname}"(${args})`);
    lines.push(`  BEGIN EXECUTE 'DROP FUNCTION IF EXISTS ${name}'; EXCEPTION WHEN undefined_function THEN END;`);
  }
  lines.push('END $$;');

  // drop tables
  lines.push('DO $$ BEGIN');
  for (const t of tables) {
    const qt = t.replace(/^(\w+)\.(\w+)$/, '"$1"."$2"');
    lines.push(`  BEGIN EXECUTE 'DROP TABLE IF EXISTS ${qt} CASCADE'; EXCEPTION WHEN undefined_table THEN END;`);
  }
  lines.push('END $$;');

  // drop sequences
  lines.push('DO $$ BEGIN');
  for (const s of sequences) {
    const qs = s.replace(/^(\w+)\.(\w+)$/, '"$1"."$2"');
    lines.push(`  BEGIN EXECUTE 'DROP SEQUENCE IF EXISTS ${qs} CASCADE'; EXCEPTION WHEN undefined_table THEN END;`);
  }
  lines.push('END $$;');

  lines.push('commit;');
  lines.push('');
  return lines.join('\n');
}

function ensureDir(path) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function main() {
  const { db, out } = parseArgs();
  const pgDump = findPgDump();
  const raw = runPgDump(pgDump, db);
  const sanitized = sanitizeDump(raw);
  const objects = extractObjects(sanitized);
  const cleanup = buildCleanup(objects);
  const boilerplate = [
    "--",
    "-- Supabase SQL Editor–ready dump",
    `-- Generated at ${new Date().toISOString()}`,
    '--',
    '',
    "SET statement_timeout = 0;",
    "SET lock_timeout = 0;",
    "SET idle_in_transaction_session_timeout = 0;",
    "SET transaction_timeout = 0;",
    "SET client_encoding = 'UTF8';",
    "SET standard_conforming_strings = on;",
    "SELECT pg_catalog.set_config('search_path', '', false);",
    "SET check_function_bodies = false;",
    "SET xmloption = content;",
    "SET client_min_messages = warning;",
    "SET row_security = off;",
    '',
  ].join('\n');

  const output = [boilerplate, cleanup, sanitized].join('\n');
  ensureDir(out);
  writeFileSync(out, output, 'utf8');
  process.stdout.write(`Dump written to ${out}\n`);
}

main();


