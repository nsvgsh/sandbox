export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../../lib/db'

async function validateInitData(initDataRaw: string): Promise<{ ok: boolean; tgUserId?: number }> {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!token) return { ok: false }
    const ttlSec = Number(process.env.INITDATA_TTL_SECONDS || '3600')
    const mod = await import('@telegram-apps/init-data-node')
    const { validate } = mod as unknown as { validate: (raw: string, opts: { botToken: string; expiresIn?: number }) => { user?: unknown } }
    const result = validate(initDataRaw, { botToken: token, expiresIn: ttlSec })
    const u = (result && (result as { user?: unknown }).user) as { id?: number } | undefined
    if (!u || typeof u.id !== 'number') return { ok: false }
    return { ok: true, tgUserId: u.id }
  } catch {
    return { ok: false }
  }
}

export async function POST(req: NextRequest) {
  let initDataRaw: string | undefined
  const corr = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string
  const dbg: Record<string, unknown> = { route: 'allowlist', corr }
  try {
    const body = (await req.json().catch(() => ({}))) as { initDataRaw?: string }
    if (body && typeof body.initDataRaw === 'string') initDataRaw = body.initDataRaw
  } catch {}
  dbg.initDataLen = initDataRaw ? initDataRaw.length : 0
  if (!initDataRaw || typeof initDataRaw !== 'string') {
    const res = NextResponse.json({ error: 'bad_request', reason: 'empty_or_short', ...dbg }, { status: 400 })
    res.headers.set('x-debug-reason', 'empty_or_short')
    res.headers.set('x-debug-corr', corr)
    res.headers.set('x-debug-initdata-len', String(dbg.initDataLen))
    res.headers.set('x-debug-token-present', String(Boolean(process.env.TELEGRAM_BOT_TOKEN)))
    return res
  }
  const v = await validateInitData(initDataRaw)
  if (!v.ok || typeof v.tgUserId !== 'number') {
    const res = NextResponse.json({ error: 'unauthorized', reason: 'invalid', ...dbg }, { status: 401 })
    res.headers.set('x-debug-reason', 'invalid')
    res.headers.set('x-debug-corr', corr)
    res.headers.set('x-debug-token-present', String(Boolean(process.env.TELEGRAM_BOT_TOKEN)))
    res.headers.set('x-debug-initdata-len', String(dbg.initDataLen))
    return res
  }
  const devEligible = await withClient(async (c) => {
    const { rows } = await c.query<{ tg_user_id: string }>('select tg_user_id from dev_whitelist where tg_user_id = $1', [v.tgUserId])
    return rows.length > 0
  })
  const resOk = NextResponse.json({ devEligible, corr }, { status: 200 })
  resOk.headers.set('x-debug-corr', corr)
  return resOk
}


