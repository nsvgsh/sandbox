#!/usr/bin/env node
// Usage:
//  node scripts/verify-initdata.mjs --token "<TELEGRAM_BOT_TOKEN>" --data "<initDataRaw>" [--ttl 3600]
// or set envs: TELEGRAM_BOT_TOKEN, INITDATA_RAW, INITDATA_TTL_SECONDS

import process from 'node:process'

async function main() {
  // Lazy import to avoid bundler quirks
  const mod = await import('@telegram-apps/init-data-node')
  const { validate } = mod

  const args = Object.fromEntries(process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/)
    if (m) return [m[1], m[2]]
    if (a.startsWith('--')) return [a.replace(/^--/, ''), true]
    return [a, true]
  }))

  const token = (args.token || process.env.TELEGRAM_BOT_TOKEN || '').trim()
  const initDataRaw = args.data || process.env.INITDATA_RAW || ''
  const ttlSec = Number(args.ttl || process.env.INITDATA_TTL_SECONDS || 3600)

  if (!token || !initDataRaw) {
    console.error('Missing --token or --data (or env TELEGRAM_BOT_TOKEN / INITDATA_RAW)')
    process.exit(2)
  }

  let result
  try {
    result = validate(initDataRaw, { botToken: token, expiresIn: ttlSec })
  } catch (e) {
    console.error('validate() threw:', e?.message || e)
    process.exit(1)
  }

  const out = {
    ok: Boolean(result?.user),
    userId: result?.user?.id ?? null,
    auth_date: result?.authDate ?? result?.auth_date ?? null,
    ttlSec,
    initDataLen: initDataRaw.length,
  }

  // Compute delta if auth_date provided (Telegram sends seconds)
  const authDate = Number(result?.authDate ?? result?.auth_date)
  if (Number.isFinite(authDate)) {
    const now = Math.floor(Date.now() / 1000)
    out.now = now
    out.deltaSec = now - authDate
    out.expired = out.deltaSec > ttlSec
  }

  console.log(JSON.stringify(out, null, 2))
  process.exit(out.ok ? 0 : 1)
}

main().catch((e) => {
  console.error('Fatal:', e?.message || e)
  process.exit(1)
})


