export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'

// HMAC validation supporting both documented derivations and raw/decoded DCS
async function validateInitData(initDataRaw: string): Promise<{
  ok: boolean
  reason?: string
  user?: { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }
}> {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
  if (!token) return { ok: false, reason: 'config_missing' }
  const ttlSec = Number(process.env.INITDATA_TTL_SECONDS || '3600')
  try {
    const { createHmac, createHash } = await import('node:crypto')
    const params = new URLSearchParams(initDataRaw)
    const hash = params.get('hash') || ''
    if (!hash) return { ok: false, reason: 'invalid' }
    const entriesRaw: { key: string; raw: string; valueRaw: string }[] = []
    for (const part of initDataRaw.split('&')) {
      const idx = part.indexOf('=')
      const key = idx >= 0 ? part.slice(0, idx) : part
      const valueRaw = idx >= 0 ? part.slice(idx + 1) : ''
      if (key === 'hash' || key === 'signature' || key === '') continue
      entriesRaw.push({ key, raw: part, valueRaw })
    }
    entriesRaw.sort((a, b) => a.key.localeCompare(b.key))
    const dcsDecoded = entriesRaw
      .map((e) => `${e.key}=${decodeURIComponent(e.valueRaw)}`)
      .join('\n')
    const dcsRaw = entriesRaw.map((e) => `${e.key}=${e.valueRaw}`).join('\n')
    const secret1 = createHash('sha256').update(token).digest()
    const secret2 = createHmac('sha256', 'WebAppData').update(token).digest()
    const cand = [
      createHmac('sha256', secret1).update(dcsDecoded).digest('hex'),
      createHmac('sha256', secret1).update(dcsRaw).digest('hex'),
      createHmac('sha256', secret2).update(dcsDecoded).digest('hex'),
      createHmac('sha256', secret2).update(dcsRaw).digest('hex'),
    ]
    const match = cand.some((h) => h === hash)
    if (!match) return { ok: false, reason: 'invalid' }
    const authDate = Number(params.get('auth_date') || '0')
    if (Number.isFinite(authDate) && authDate > 0) {
      const now = Math.floor(Date.now() / 1000)
      if (now - authDate > ttlSec) return { ok: false, reason: 'expired' }
    }
    // Minimal user extraction (decoded JSON string)
    let user:
      | { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }
      | undefined
    try {
      const userStr = params.get('user') || ''
      const parsed = userStr ? (JSON.parse(decodeURIComponent(userStr)) as unknown) : undefined
      if (parsed && typeof (parsed as { id?: unknown }).id === 'number') {
        user = parsed as {
          id: number
          first_name?: string
          last_name?: string
          username?: string
          photo_url?: string
        }
      }
    } catch {}
    if (!user) return { ok: false, reason: 'no_user' }
    return { ok: true, user }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}

export async function POST(req: NextRequest) {
  // Accept JSON body { initDataRaw } or Authorization: tma <initDataRaw>
  let initDataRaw: string | undefined
  const corr = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string
  const dbg: Record<string, unknown> = { route: 'auth_tg', corr }
  try {
    const auth = req.headers.get('authorization') || ''
    if (auth.toLowerCase().startsWith('tma ')) initDataRaw = auth.slice(4)
  } catch { /* ignore */ }
  if (!initDataRaw) {
    try {
      const body = (await req.json().catch(() => ({}))) as { initDataRaw?: string }
      if (body && typeof body.initDataRaw === 'string') initDataRaw = body.initDataRaw
    } catch {}
  }
  dbg.initDataLen = initDataRaw ? initDataRaw.length : 0
  if (!initDataRaw || typeof initDataRaw !== 'string' || initDataRaw.length < 8) {
    const res = NextResponse.json({ error: 'bad_request', reason: 'empty_or_short', ...dbg }, { status: 400 })
    res.headers.set('x-debug-reason', 'empty_or_short')
    res.headers.set('x-debug-corr', corr)
    res.headers.set('x-debug-initdata-len', String(dbg.initDataLen))
    res.headers.set('x-debug-token-present', String(Boolean(process.env.TELEGRAM_BOT_TOKEN)))
    return res
  }

  const v = await validateInitData(initDataRaw)
  dbg.tokenPresent = Boolean(process.env.TELEGRAM_BOT_TOKEN)
  if (!v.ok || !v.user) {
    const reason = v.reason || 'invalid'
    const res = NextResponse.json({ error: 'unauthorized', reason, ...dbg }, { status: 401 })
    res.headers.set('x-debug-reason', reason)
    res.headers.set('x-debug-corr', corr)
    res.headers.set('x-debug-runtime', 'nodejs')
    res.headers.set('x-debug-region', process.env.VERCEL_REGION || 'local')
    res.headers.set('x-debug-token-present', String(Boolean(process.env.TELEGRAM_BOT_TOKEN)))
    res.headers.set('x-debug-initdata-len', String(dbg.initDataLen))
    return res
  }
  const tg = v.user
  dbg.userId = tg.id

  // Upsert mapping and ensure user exists
  const userId = await withClient(async (c) => {
    // Try find existing mapping
    const q1 = await c.query<{ user_id: string }>('select user_id from telegram_identities where tg_user_id = $1', [tg.id])
    if (q1.rows.length > 0) return q1.rows[0].user_id

    // Create user profile and mapping in a xact
    await c.query('begin')
    try {
      // Create user if not exists
      const insUser = await c.query<{ user_id: string }>(
        'insert into user_profiles(user_id) values (gen_random_uuid()) returning user_id'
      )
      const newUserId = insUser.rows[0].user_id
      await c.query(
        'insert into telegram_identities(tg_user_id, user_id, first_name, last_name, username, photo_url) values ($1,$2,$3,$4,$5,$6)',
        [tg.id, newUserId, tg.first_name || null, tg.last_name || null, tg.username || null, tg.photo_url || null]
      )
      await c.query('commit')
      return newUserId
    } catch (e) {
      try { await c.query('rollback') } catch {}
      // Retry read in case another worker just created it
      const q2 = await c.query<{ user_id: string }>('select user_id from telegram_identities where tg_user_id = $1', [tg.id])
      if (q2.rows.length > 0) return q2.rows[0].user_id
      throw e
    }
  })

  // Set cross-site compatible cookie for Telegram WebView
  const cookieStore = await cookies()
  cookieStore.set('dev_session', userId, { httpOnly: true, sameSite: 'none', secure: true, path: '/' })
  const resOk = NextResponse.json({ ok: true, user: { userId, tgUserId: tg.id }, corr }, { status: 200 })
  resOk.headers.set('x-debug-corr', corr)
  resOk.headers.set('x-debug-region', process.env.VERCEL_REGION || 'local')
  return resOk
}


