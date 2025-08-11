export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../lib/db'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const row = await withClient(async (c) => {
    const { rows } = await c.query('select coins, tickets, coin_multiplier as "coinMultiplier", level, total_taps as "totalTaps" from user_counters where user_id=$1', [userId])
    return rows[0] || { coins: 0, tickets: 0, coinMultiplier: 1.0, level: 0, totalTaps: 0 }
  })
  const nextThreshold = await withClient(async (c) => {
    const { rows } = await c.query('select (_next_threshold($1)) as nt', [Number(row.level || 0)])
    return rows[0]?.nt || { level: Number(row.level || 0) + 1, coins: (Number(row.level || 0) + 1) * 10 }
  })
  return NextResponse.json({ counters: row, nextThreshold })
}
