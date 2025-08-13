export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as {
    provider?: string
    placement?: string
    status?: string
    impressionId?: string
    intent?: string // e.g. 'level_bonus' or 'task:<taskId>'
  }
  const provider = body.provider || 'stub'
  const placement = body.placement || 'level_bonus'
  const status = body.status || 'completed'
  const impressionId = body.impressionId || randomUUID()
  const intent = typeof body.intent === 'string' && body.intent.trim() ? body.intent.trim() : undefined

  // Record ad event only. Do not apply bonus here (bonus is applied on explicit Claim x2).
  const result = await withClient(async (c) => {
    // insert ad_event
    const payload: Record<string, unknown> = { impressionId }
    if (intent) payload.intent = intent
    await c.query(
      'insert into ad_events(id, user_id, session_id, provider, placement, status, reward_payload) values (gen_random_uuid(), $1, null, $2, $3, $4, $5)',
      [userId, provider, placement, status, JSON.stringify(payload)]
    )

    const isLevelBonusIntent = intent === 'level_bonus' || placement === 'level_bonus'
    if (isLevelBonusIntent) {
      const { rows: adTTLRows } = await c.query("select coalesce((value)::int, 180) as ttl from game_config where key='ad_ttl_seconds'")
      const ttl = Number(adTTLRows[0]?.ttl || 180)
      return { recorded: true, impressionId, expiresInSec: ttl }
    }
    return { recorded: true, impressionId }
  })
  return NextResponse.json(result)
}
