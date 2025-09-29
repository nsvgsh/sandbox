import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const expected = process.env.DEV_TOKEN
  const provided = req.headers.get('x-dev-token') || req.headers.get('dev-token')
  if (!expected || !provided || expected !== provided) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  // If x-telegram-user-id is provided and whitelisted, bind session to the mapped user_id (or create mapping+user)
  const tgIdHeader = req.headers.get('x-telegram-user-id')
  let userId: string | null = null
  if (tgIdHeader && /^\d+$/.test(tgIdHeader)) {
    const tgUserId = Number(tgIdHeader)
    try {
      const { withClient } = await import('../../../../../lib/db')
      userId = await withClient(async (c) => {
        // Ensure in whitelist
        const w = await c.query('select tg_user_id from dev_whitelist where tg_user_id = $1', [tgUserId])
        if (w.rows.length === 0) {
          throw new Error('not_whitelisted')
        }
        // Find mapping
        const m = await c.query<{ user_id: string }>('select user_id from telegram_identities where tg_user_id = $1', [tgUserId])
        if (m.rows.length > 0) return m.rows[0].user_id
        // Create user + mapping
        await c.query('begin')
        try {
          const u = await c.query<{ user_id: string }>('insert into user_profiles(user_id) values (gen_random_uuid()) returning user_id')
          const newUid = u.rows[0].user_id
          await c.query('insert into telegram_identities(tg_user_id, user_id) values ($1,$2)', [tgUserId, newUid])
          await c.query('commit')
          return newUid
        } catch (e) {
          try { await c.query('rollback') } catch {}
          const m2 = await c.query<{ user_id: string }>('select user_id from telegram_identities where tg_user_id = $1', [tgUserId])
          if (m2.rows.length > 0) return m2.rows[0].user_id
          throw e
        }
      })
    } catch (e) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
  }
  if (!userId) {
    const allowRandom = String(process.env.ENABLE_RANDOM_DEV_USER || '0') === '1'
    if (!allowRandom) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 })
    }
    userId = randomUUID()
  }
  const cookieStore = await cookies()
  // Cross-site compatible for Telegram Web (iframe): SameSite=None; Secure
  cookieStore.set('dev_session', userId, { httpOnly: true, sameSite: 'none', secure: true, path: '/' })
  return NextResponse.json({ userId })
}
