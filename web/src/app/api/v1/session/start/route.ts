export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'
import { maybeSendFirstConversion } from '../../../../../lib/partners/propeller'

export async function POST() {
  const cookieStore = await cookies()
  let userId = cookieStore.get('dev_session')?.value
  if (!userId) {
    // Dev header fallback for Telegram Web (3PC blocked)
    const headersList = (await import('next/headers')).headers
    const reqHeaders = await headersList()
    const devToken = reqHeaders.get('x-dev-token')
    const providedUser = reqHeaders.get('x-user-id')
    const expected = process.env.DEV_TOKEN
    if (expected && devToken === expected && providedUser) {
      userId = providedUser
    }
  }
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const row = await withClient(async (c) => {
    const { rows } = await c.query('select * from session_start($1)', [userId])
    // Best-effort: attempt PropellerAds first conversion postback if attributed
    try {
      await maybeSendFirstConversion(c, userId!)
    } catch {}
    return rows[0]
  })

  const payload = { sessionId: row.session_id, sessionEpoch: row.session_epoch, lastAppliedSeq: row.last_applied_seq }
  try {
    // Dev log
    console.log(JSON.stringify({ event: 'session_start', userId: String(userId).slice(0, 8), sessionId: payload.sessionId, sessionEpoch: payload.sessionEpoch }))
  } catch {}
  return NextResponse.json(payload)
}
