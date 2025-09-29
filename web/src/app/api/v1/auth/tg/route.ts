export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'

// Lazy import to keep edge/node compat reasonable
async function validateInitData(initDataRaw: string): Promise<{
  ok: boolean
  reason?: string
  user?: { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }
}> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return { ok: false, reason: 'config_missing' }
    const ttlSec = Number(process.env.INITDATA_TTL_SECONDS || '3600')
    // Use @telegram-apps/init-data-node if available; fall back to manual validation later if needed
    const mod = await import('@telegram-apps/init-data-node')
    const { validate } = mod as unknown as { validate: (raw: string, opts: { botToken: string; expiresIn?: number }) => { user?: unknown } }
    const result = validate(initDataRaw, { botToken: token, expiresIn: ttlSec })
    const u = (result && (result as { user?: unknown }).user) as
      | { id: number; first_name?: string; last_name?: string; username?: string; photo_url?: string }
      | undefined
    if (!u || typeof u.id !== 'number') return { ok: false, reason: 'no_user' }
    return { ok: true, user: u }
  } catch (e) {
    return { ok: false, reason: 'invalid' }
  }
}

export async function POST(req: NextRequest) {
  // Accept JSON body { initDataRaw } or Authorization: tma <initDataRaw>
  let initDataRaw: string | undefined
  try {
    const auth = req.headers.get('authorization') || ''
    if (auth.toLowerCase().startsWith('tma ')) initDataRaw = auth.slice(4)
  } catch {}
  if (!initDataRaw) {
    try {
      const body = (await req.json().catch(() => ({}))) as { initDataRaw?: string }
      if (body && typeof body.initDataRaw === 'string') initDataRaw = body.initDataRaw
    } catch {}
  }
  if (!initDataRaw || typeof initDataRaw !== 'string' || initDataRaw.length < 8) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const v = await validateInitData(initDataRaw)
  if (!v.ok || !v.user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const tg = v.user

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

  return NextResponse.json({ ok: true, user: { userId, tgUserId: tg.id } })
}


