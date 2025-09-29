export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../../lib/db'

async function validateInitData(initDataRaw: string): Promise<{ ok: boolean; tgUserId?: number }> {
  const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim()
  if (!token) return { ok: false }
  const ttlSec = Number(process.env.INITDATA_TTL_SECONDS || '3600')
  try {
    const { createHmac, createHash } = await import('node:crypto')
    const params = new URLSearchParams(initDataRaw)
    const hash = params.get('hash') || ''
    if (!hash) return { ok: false }
    const entriesRaw: { key: string; valueRaw: string }[] = []
    for (const part of initDataRaw.split('&')) {
      const idx = part.indexOf('=')
      const key = idx >= 0 ? part.slice(0, idx) : part
      const valueRaw = idx >= 0 ? part.slice(idx + 1) : ''
      if (key === 'hash' || key === 'signature' || key === '') continue
      entriesRaw.push({ key, valueRaw })
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
    if (!match) return { ok: false }
    const authDate = Number(params.get('auth_date') || '0')
    if (Number.isFinite(authDate) && authDate > 0) {
      const now = Math.floor(Date.now() / 1000)
      if (now - authDate > ttlSec) return { ok: false }
    }
    let tgUserId: number | undefined
    try {
      const userStr = params.get('user') || ''
      const parsed = userStr ? (JSON.parse(decodeURIComponent(userStr)) as unknown) : undefined
      if (parsed && typeof (parsed as { id?: unknown }).id === 'number') tgUserId = (parsed as { id: number }).id
    } catch {}
    if (!tgUserId) return { ok: false }
    return { ok: true, tgUserId }
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


