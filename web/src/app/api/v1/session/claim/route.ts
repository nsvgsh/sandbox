export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { sessionId?: string; sessionEpoch?: string }
  const providedSessionId = typeof body.sessionId === 'string' ? body.sessionId : undefined
  const providedSessionEpoch = typeof body.sessionEpoch === 'string' ? body.sessionEpoch : undefined

  if (providedSessionId && !isUuid(providedSessionId)) {
    return NextResponse.json({ error: 'bad_request', code: 'BAD_SESSION_ID' }, { status: 400 })
  }
  if (providedSessionEpoch && !isUuid(providedSessionEpoch)) {
    return NextResponse.json({ error: 'bad_request', code: 'BAD_SESSION_EPOCH' }, { status: 400 })
  }

  try {
    const current = await withClient(async (c) => {
      const { rows } = await c.query(
        'select current_session_id as "sessionId", session_epoch as "sessionEpoch", last_applied_seq as "lastAppliedSeq" from user_counters where user_id=$1',
        [userId]
      )
      return rows[0] as { sessionId?: string; sessionEpoch?: string; lastAppliedSeq?: number } | undefined
    })

    const hasExisting = Boolean(current && current.sessionId && current.sessionEpoch)
    const providedBoth = Boolean(providedSessionId && providedSessionEpoch)
    const matches =
      hasExisting &&
      providedBoth &&
      current!.sessionId === providedSessionId &&
      current!.sessionEpoch === providedSessionEpoch

    if (matches) {
      const payload = {
        sessionId: current!.sessionId!,
        sessionEpoch: current!.sessionEpoch!,
        lastAppliedSeq: Number(current!.lastAppliedSeq || 0),
      }
      try {
        console.log(
          JSON.stringify({ event: 'session_claim_match', userId: String(userId).slice(0, 8), sessionId: payload.sessionId, sessionEpoch: payload.sessionEpoch })
        )
      } catch {}
      return NextResponse.json(payload)
    }

    // rotate (or initialize) if no match, missing, or no existing record
    const rotated = await withClient(async (c) => {
      const { rows } = await c.query('select * from session_start($1)', [userId])
      return rows[0] as { session_id: string; session_epoch: string; last_applied_seq: number }
    })

    const payload = { sessionId: rotated.session_id, sessionEpoch: rotated.session_epoch, lastAppliedSeq: rotated.last_applied_seq }
    try {
      console.log(
        JSON.stringify({ event: 'session_claim_rotated', userId: String(userId).slice(0, 8), sessionId: payload.sessionId, sessionEpoch: payload.sessionEpoch })
      )
    } catch {}
    return NextResponse.json(payload)
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    try {
      console.log(JSON.stringify({ event: 'session_claim_err', userId: String(userId).slice(0, 8), msg }))
    } catch {}
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
