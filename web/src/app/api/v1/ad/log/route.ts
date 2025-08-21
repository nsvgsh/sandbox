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
  const status = (body.status as string) || 'closed'
  const impressionId = body.impressionId || randomUUID()
  const intent = typeof body.intent === 'string' && body.intent.trim() ? body.intent.trim() : undefined

  // Record ad event only. Do not apply bonus here (bonus is applied on explicit Claim x2).
  const result = await withClient(async (c) => {
    // insert ad_event
    const payload: Record<string, unknown> = { impressionId }
    if (intent) payload.intent = intent
    if (status === 'closed' && body.result && typeof body.result === 'object') {
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

    return { recorded: true, impressionId }
  })
  return NextResponse.json(result)
}
