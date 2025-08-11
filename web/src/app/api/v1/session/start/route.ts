export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'

export async function POST() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const row = await withClient(async (c) => {
    const { rows } = await c.query('select * from session_start($1)', [userId])
    return rows[0]
  })

  const payload = { sessionId: row.session_id, sessionEpoch: row.session_epoch, lastAppliedSeq: row.last_applied_seq }
  try {
    // Dev log
    console.log(JSON.stringify({ event: 'session_start', userId: String(userId).slice(0, 8), sessionId: payload.sessionId, sessionEpoch: payload.sessionEpoch }))
  } catch {}
  return NextResponse.json(payload)
}
