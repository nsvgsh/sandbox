export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../../lib/db'

type Thresholds = { base: number; growth: string; batch_min_interval_ms?: number }

export async function POST(req: NextRequest) {
  const token = req.headers.get('x-dev-token') || ''
  if (!process.env.DEV_TOKEN || token !== process.env.DEV_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const body = (await req.json().catch(() => ({}))) as { base?: number; batchMinIntervalMs?: number }
  if (typeof body.base !== 'number' && typeof body.batchMinIntervalMs !== 'number') {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
  const updated = await withClient(async (c) => {
    const cur = await c.query("select value from game_config where key='thresholds'")
    const val = (cur.rows[0]?.value ?? { base: 1000, growth: 'linear' }) as Thresholds
    if (typeof body.base === 'number') val.base = body.base
    if (typeof body.batchMinIntervalMs === 'number') val.batch_min_interval_ms = body.batchMinIntervalMs
    await c.query("update game_config set value=$1::jsonb where key='thresholds'", [JSON.stringify(val)])
    return val
  })
  return NextResponse.json({ thresholds: updated })
}
