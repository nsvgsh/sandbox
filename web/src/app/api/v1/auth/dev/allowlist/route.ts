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
  try {
    const body = (await req.json().catch(() => ({}))) as { initDataRaw?: string }
    if (body && typeof body.initDataRaw === 'string') initDataRaw = body.initDataRaw
  } catch {}
  if (!initDataRaw || typeof initDataRaw !== 'string') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
  const v = await validateInitData(initDataRaw)
  if (!v.ok || typeof v.tgUserId !== 'number') {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const devEligible = await withClient(async (c) => {
    const { rows } = await c.query<{ tg_user_id: string }>('select tg_user_id from dev_whitelist where tg_user_id = $1', [v.tgUserId])
    return rows.length > 0
  })
  return NextResponse.json({ devEligible })
}


