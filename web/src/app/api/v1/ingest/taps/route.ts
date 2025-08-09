export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  type IngestBody = { taps?: number; coinsDelta?: number; clientSeq?: number }
  const parsed: IngestBody = await req.json().catch(() => ({} as IngestBody))
  const taps = typeof parsed.taps === 'number' ? parsed.taps : 1
  const coinsDelta = typeof parsed.coinsDelta === 'number' ? parsed.coinsDelta : taps
  const clientSeq = typeof parsed.clientSeq === 'number' ? parsed.clientSeq : 0

  const result = await withClient(async (c) => {
    await c.query('begin')
    const { rows: countersRows } = await c.query('select * from user_counters where user_id=$1 for update', [userId])
    const counters = countersRows[0] || {}
    const coins = Number(counters.coins || 0) + coinsDelta
    const totalTaps = Number(counters.total_taps || 0) + taps
    const level = Number(counters.level || 0)

    await c.query(
      `insert into user_counters(user_id, coins, total_taps, level)
       values($1,$2,$3,$4)
       on conflict (user_id) do update set coins=excluded.coins, total_taps=excluded.total_taps, level=excluded.level`,
      [userId, coins, totalTaps, level]
    )

    await c.query(
      `insert into tap_batches(batch_id, user_id, session_id, client_seq, taps, coins_delta, status)
       values($1, $2, $3, $4, $5, $6, 'applied')`,
      [randomUUID(), userId, counters.current_session_id || null, clientSeq, taps, coinsDelta]
    )

    await c.query('commit')
    return {
      coins,
      tickets: Number(counters.tickets || 0),
      coinMultiplier: Number(counters.coin_multiplier || 1.0),
      level,
      totalTaps,
    }
  })

  return NextResponse.json({
    counters: result,
    nextThreshold: { level: result.level + 1, coins: (result.level + 1) * 1000 },
  })
}
