export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'
import { randomUUID } from 'crypto'
import { sendMonetagMilestonePostback } from '../../../../../lib/partners/propeller'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as {
    provider?: string
    placement?: string
    status?: 'closed' | 'failed' | 'used' | string
    impressionId?: string
    intent?: string // e.g. 'level_bonus' or 'task:<taskId>'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result?: any // raw monetag result on success
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: any // { reason: 'no_feed' | 'sdk_not_loaded' | 'timeout' | 'popup_blocked' | 'unknown', ... }
  }
  const provider = body.provider || 'stub'
  const placement = body.placement || 'level_bonus'
  // Derive canonical status on server: 'completed' on valued result; otherwise 'failed'
  let status: 'completed' | 'failed' = 'failed'
  try {
    const rewardType = body?.result?.reward_event_type
    if (rewardType === 'valued') status = 'completed'
  } catch {}
  const impressionId = body.impressionId || randomUUID()
  const intent = typeof body.intent === 'string' && body.intent.trim() ? body.intent.trim() : undefined

  // Record ad event only. Do not apply bonus here (bonus is applied on explicit Claim x2).
  const result = await withClient(async (c) => {
    // insert ad_event
    const payload: Record<string, unknown> = { impressionId }
    if (intent) payload.intent = intent
    if (status === 'completed' && body.result && typeof body.result === 'object') {
      try {
        payload.monetag = body.result
      } catch {}
    }
    if (status === 'failed' && body.error && typeof body.error === 'object') {
      try {
        payload.error = body.error
      } catch {}
    }
    await c.query(
      'insert into ad_events(id, user_id, session_id, provider, placement, status, reward_payload) values (gen_random_uuid(), $1, null, $2, $3, $4, $5)',
      [userId, provider, placement, status, JSON.stringify(payload)]
    )

    // Monetag milestone mapping → PropellerAds goals
    if (provider === 'monetag' && status === 'completed') {
      const { rows: cntRows } = await c.query<{ n: string }>(
        "select count(1) as n from ad_events where user_id=$1 and provider='monetag' and status='completed'",
        [userId]
      )
      const n = Number(cntRows?.[0]?.n || 0)
      if (n === 1) { try { await sendMonetagMilestonePostback(c, userId, '2') } catch {} }
      if (n === 3) { try { await sendMonetagMilestonePostback(c, userId, '3') } catch {} }
    }

    return { recorded: true, impressionId }
  })
  return NextResponse.json(result)
}
