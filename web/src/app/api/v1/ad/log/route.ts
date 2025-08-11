export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as { provider?: string; placement?: string; status?: string; impressionId?: string }
  const provider = body.provider || 'stub'
  const placement = body.placement || 'level_bonus'
  const status = body.status || 'completed'
  const impressionId = body.impressionId || randomUUID()

  // Soft-apply path: record ad event, then auto-apply level bonus if eligible
  const result = await withClient(async (c) => {
    // insert ad_event
    await c.query(
      'insert into ad_events(id, user_id, session_id, provider, placement, status, reward_payload) values (gen_random_uuid(), $1, null, $2, $3, $4, $5)',
      [userId, provider, placement, status, JSON.stringify({ impressionId })]
    )
    // TTL from config
    const { rows: adTTLRows } = await c.query("select coalesce((value)::int, 180) as ttl from game_config where key='ad_ttl_seconds'")
    const ttl = Number(adTTLRows[0]?.ttl || 180)
    // find latest eligible level_event
    const { rows: evtRows } = await c.query(
      'select id, level, reward_payload from level_events where user_id=$1 and bonus_multiplier is null and created_at >= now() - make_interval(secs => $2) order by created_at desc limit 1',
      [userId, ttl]
    )
    if (!evtRows[0]) return { applied: false, code: 'NOTHING_TO_APPLY' }
    // apply incremental bonus x2 by default (can be extended to read from config or client)
    const idem = impressionId
    const bonusMultiplier = 2
    const { rows: claimRows } = await c.query('select * from claim_level_bonus($1,$2,$3,$4::uuid)', [userId, evtRows[0].level, bonusMultiplier, idem])
    return { applied: true, counters: claimRows[0] }
  })
  return NextResponse.json(result)
}
