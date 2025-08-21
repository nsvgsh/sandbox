export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../../lib/db'

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { level, bonusMultiplier, impressionId } = (await req.json().catch(() => ({}))) as { level?: number; bonusMultiplier?: number; impressionId?: string }
  if (typeof level !== 'number' || typeof bonusMultiplier !== 'number') return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  // Validate there's a recent ad_event for level_bonus (and match by impressionId if provided)
  const idem = impressionId && isUuid(impressionId) ? impressionId : (req.headers.get('x-idempotency-key') || '')
  if (!isUuid(idem)) return NextResponse.json({ error: 'bad_request', code: 'BAD_IDEMPOTENCY_KEY' }, { status: 400 })
  try {
    const row = await withClient(async (c) => {
      const { rows } = await c.query('select * from claim_level_bonus_v4($1,$2,$3,$4::uuid,$5::uuid)', [userId, level, bonusMultiplier, idem, impressionId])
      return rows[0]
    })
    const nextThreshold = await withClient(async (c) => {
      const { rows } = await c.query('select (_next_threshold($1)) as nt', [Number(row.level || 0)])
      return rows[0]?.nt || { level: Number(row.level || 0) + 1, coins: (Number(row.level || 0) + 1) * 10 }
    })
    try {
      console.log(JSON.stringify({ event: 'claim_ok', userId: String(userId).slice(0, 8), level, bonusMultiplier, counters: row, nextThreshold }))
    } catch {}
    return NextResponse.json({ rewardEventId: null, counters: row, nextThreshold })
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    try { console.log(JSON.stringify({ event: 'claim_err', userId: String(userId).slice(0, 8), level, bonusMultiplier, msg })) } catch {}
    if (msg.includes('ALREADY_CLAIMED')) return NextResponse.json({ code: 'ALREADY_CLAIMED' }, { status: 409 })
    if (msg.includes('TTL_EXPIRED')) return NextResponse.json({ code: 'TTL_EXPIRED' }, { status: 409 })
    if (msg.includes('NOT_FOUND')) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ error: 'server_error', message: msg }, { status: 500 })
  }
}
