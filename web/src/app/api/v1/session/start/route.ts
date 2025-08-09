export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { withClient } from '../../../../../lib/db'

export async function POST() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const sessionId = randomUUID()
  const sessionEpoch = randomUUID()

  await withClient(async (c) => {
    await c.query('insert into user_profiles(user_id) values($1) on conflict (user_id) do nothing', [userId])
    await c.query(
      `insert into user_counters(user_id, session_epoch, current_session_id, last_applied_seq)
       values($1, $2, $3, 0)
       on conflict (user_id) do update set session_epoch=$2, current_session_id=$3, last_applied_seq=0`,
      [userId, sessionEpoch, sessionId]
    )
  })

  return NextResponse.json({ sessionId, sessionEpoch, lastAppliedSeq: 0 })
}
