export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const row = await withClient(async (c) => {
    const { rows } = await c.query(
      'select level, reward_payload as "rewardPayload" from level_events where user_id=$1 order by created_at desc limit 1',
      [userId]
    )
    return rows[0] || { level: null, rewardPayload: null }
  })
  return NextResponse.json(row)
}


