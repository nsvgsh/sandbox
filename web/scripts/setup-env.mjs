#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsDir = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(scriptsDir, '..')
const repoRoot = path.resolve(webRoot, '..')
const envLocal = path.join(webRoot, '.env.local')
const docsEnvExample = path.join(repoRoot, 'docs', 'env.example')

function ensureSource() {
  if (!fs.existsSync(docsEnvExample)) {
    console.error('Missing docs/env.example. Please add it to the repo.')
    process.exit(1)
  }
}

function parseEnv(content) {
  const map = new Map()
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1)
    map.set(key, value)
  }
  return map
}

function generateWebEnv() {
  const src = fs.readFileSync(docsEnvExample, 'utf8')
  const srcMap = parseEnv(src)
  const out = new Map()

  // Include server/client keys used by web
  const includeKeys = [
    'DATABASE_URL',
    'DEV_TOKEN',
    'NEXT_PUBLIC_DEV_TOKEN',
    'NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  ]
  for (const key of includeKeys) {
    if (srcMap.has(key)) out.set(key, srcMap.get(key))
  }

  // Inject DATABASE_URL default if missing in docs/env.example
  if (!out.has('DATABASE_URL')) {
    out.set('DATABASE_URL', 'postgresql://postgres:postgres@127.0.0.1:54322/postgres')
  }

  // Ensure NEXT_PUBLIC_DEV_TOKEN mirrors DEV_TOKEN if available
  if (out.has('DEV_TOKEN')) {
    const token = out.get('DEV_TOKEN')
    out.set('NEXT_PUBLIC_DEV_TOKEN', token)
  }

  // Stable order for readability
  const order = [
    'DATABASE_URL',
    'DEV_TOKEN',
    'NEXT_PUBLIC_DEV_TOKEN',
    'NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  ]
  const keys = Array.from(new Set([...order, ...out.keys()]))
  const lines = []
  for (const key of keys) {
    if (!out.has(key)) continue
    lines.push(`${key}=${out.get(key)}`)
  }
  return lines.join('\n') + '\n'
}

ensureSource()
if (!fs.existsSync(envLocal)) {
  fs.writeFileSync(envLocal, generateWebEnv(), 'utf8')
  console.log('Created web/.env.local from docs/env.example subset.')
} else {
  // Do a non-destructive sync of DEV_TOKEN -> NEXT_PUBLIC_DEV_TOKEN
  try {
    const content = fs.readFileSync(envLocal, 'utf8')
    const map = parseEnv(content)
    const src = fs.readFileSync(docsEnvExample, 'utf8')
    const srcMap = parseEnv(src)
    let wrote = false
    if (map.has('DEV_TOKEN')) {
      const token = map.get('DEV_TOKEN')
      if (!map.has('NEXT_PUBLIC_DEV_TOKEN') || map.get('NEXT_PUBLIC_DEV_TOKEN') !== token) {
        map.set('NEXT_PUBLIC_DEV_TOKEN', token)
        wrote = true
        console.log('Synced NEXT_PUBLIC_DEV_TOKEN to match DEV_TOKEN in web/.env.local')
      }
    }
    // Ensure DATABASE_URL exists; if missing, add from docs/env.example or fallback
    if (!map.has('DATABASE_URL')) {
      const defaultDbUrl = srcMap.get('DATABASE_URL') || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'
      map.set('DATABASE_URL', defaultDbUrl)
      wrote = true
      console.log('Added DATABASE_URL to web/.env.local from docs/env.example default')
    }
    if (wrote) {
      const order = Array.from(map.keys())
      const updated = order.map(k => `${k}=${map.get(k)}`).join('\n') + '\n'
      fs.writeFileSync(envLocal, updated, 'utf8')
    }
  } catch {
    // Ignore sync errors; keep developer edits intact
  }
}

console.log('web/.env.local is ready.')
