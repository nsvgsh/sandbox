export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'
import { randomUUID } from 'crypto'

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  type IngestBody = { taps?: number; clientSeq?: number; checksum?: string; sessionId?: string; sessionEpoch?: string }
  const parsed: IngestBody = await req.json().catch(() => ({} as IngestBody))
  const taps = typeof parsed.taps === 'number' ? parsed.taps : 1
  const clientSeq = typeof parsed.clientSeq === 'number' ? parsed.clientSeq : 0
  const checksum = parsed.checksum || 'sha256:dev'
  const sessionId = parsed.sessionId || null
  const sessionEpoch = parsed.sessionEpoch || null
  const headerKey = req.headers.get('x-idempotency-key') || ''
  const idempotencyKey = headerKey && isUuid(headerKey) ? headerKey : randomUUID()

  try {
    const row = await withClient(async (c) => {
      // Soft validation: clamp taps and checksum awareness
      const ingestCfg = await c.query("select value from game_config where key='ingest'")
      const cfg = (ingestCfg.rows[0]?.value || {}) as { max_taps_per_batch?: number; clamp_soft?: boolean }
      const maxTaps = Number(cfg.max_taps_per_batch || 0)
      const clampSoft = Boolean(cfg.clamp_soft ?? true)
      if (maxTaps > 0 && taps > maxTaps && clampSoft) {
        try { console.warn(JSON.stringify({ event: 'ingest_warn', code: 'CLAMP_TAPS_SOFT', userId: String(userId).slice(0,8), taps, maxTaps })) } catch {}
      }
      const { rows } = await c.query(
        'select * from apply_tap_batch($1,$2,$3,$4,$5,$6,$7,$8)',
        [userId, idempotencyKey, sessionId, sessionEpoch, clientSeq, taps, 0, checksum]
      )
      return rows[0]
    })

    const response = {
      counters: {
        coins: Number(row.coins || 0),
        tickets: Number(row.tickets || 0),
        coinMultiplier: Number(row.coin_multiplier || 1),
        level: Number(row.level || 0),
        totalTaps: Number(row.total_taps || 0),
      },
      nextThreshold: row.next_threshold,
      leveledUp: row.leveled_up || undefined,
    }
    try {
      console.log(JSON.stringify({ event: 'ingest_ok', userId: String(userId).slice(0, 8), idempotencyKey, clientSeq, taps, response }))
    } catch {}
    return NextResponse.json(response)
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    const code = msg.includes('SUPERSEDED') ? 'SUPERSEDED'
      : msg.includes('SEQ_REWIND') ? 'SEQ_REWIND'
      : msg.includes('RATE_LIMITED') ? 'RATE_LIMITED'
      : msg.includes('USER_NOT_INITIALIZED') ? 'USER_NOT_INITIALIZED'
      : msg.toLowerCase().includes('invalid input syntax for type uuid') ? 'BAD_IDEMPOTENCY_KEY'
      : 'SERVER_ERROR'
    try {
      console.log(JSON.stringify({ event: 'ingest_err', userId: String(userId).slice(0, 8), idempotencyKey, clientSeq, taps, code, msg }))
    } catch {}
    if (code === 'SUPERSEDED' || code === 'SEQ_REWIND') return NextResponse.json({ code }, { status: 409 })
    if (code === 'RATE_LIMITED') return NextResponse.json({ code }, { status: 429 })
    if (code === 'BAD_IDEMPOTENCY_KEY') return NextResponse.json({ code }, { status: 400 })
    return NextResponse.json({ error: 'server_error', message: msg }, { status: 500 })
  }
}
