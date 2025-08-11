export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../../lib/db'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split('/').filter(Boolean)
    // .../api/v1/tasks/{taskId}/claim → find "tasks" index
    const i = parts.findIndex((p) => p === 'tasks')
    const taskId = i >= 0 && parts[i + 1] ? parts[i + 1] : ''
    if (!taskId) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

    const row = await withClient(async (c) => {
      // Enforce ad requirement if this is an ad-view task (by convention: kind='in_app' still, but we check placement mapping if present later)
      const { rows: def } = await c.query('select kind, unlock_level, reward_payload from task_definitions where task_id=$1', [taskId])
      const isAdTask = true
      if (isAdTask) {
        const { rows: ttlRows } = await c.query("select coalesce((value)::int, 180) as ttl from game_config where key='ad_ttl_seconds'")
        const ttl = Number(ttlRows[0]?.ttl || 180)
        // Prefer an intent-bound ad for this task; fall back to any recent completed ad for backward compatibility
        const { rows: adRows } = await c.query(
          "select id from ad_events where user_id=$1 and status='completed' and created_at >= now() - make_interval(secs => $2) and ((reward_payload->>'intent') = $3 or (reward_payload->>'intent') is null) order by created_at desc limit 1",
          [userId, ttl, `task:${taskId}`]
        )
        if (!adRows[0]) throw new Error('AD_REQUIRED')
      }
      const { rows } = await c.query('select * from claim_task($1,$2::uuid)', [userId, taskId])
      return rows[0]
    })
    return NextResponse.json({ state: row.state, counters: { coins: row.coins, tickets: row.tickets, coinMultiplier: row.coin_multiplier, level: row.level, totalTaps: row.total_taps } })
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    if (msg.includes('ALREADY_CLAIMED')) return NextResponse.json({ code: 'ALREADY_CLAIMED' }, { status: 409 })
    if (msg.includes('AD_REQUIRED')) return NextResponse.json({ code: 'AD_REQUIRED' }, { status: 409 })
    if (msg.includes('VERIFICATION_REQUIRED')) return NextResponse.json({ code: 'VERIFICATION_REQUIRED' }, { status: 400 })
    if (msg.includes('NOT_FOUND')) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
