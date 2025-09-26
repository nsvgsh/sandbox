export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../../lib/db'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const url = new URL(req.url)
    const parts = url.pathname.split('/').filter(Boolean)
    // .../api/v1/tasks/{taskId}/ready
    const i = parts.findIndex((p) => p === 'tasks')
    const taskId = i >= 0 && parts[i + 1] ? parts[i + 1] : ''
    if (!taskId) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

    const data = await withClient(async (c) => {
      // validate free-trial task and active (no join)
      const { rows: trows } = await c.query(
        `select task_id as "taskId", active, kind from task_definitions where task_id=$1 and active=true`,
        [taskId]
      )
      if (!trows[0]) throw new Error('NOT_FOUND')
      const isFreeTrial = String(trows[0].kind || '') === 'free-trial'
      if (!isFreeTrial) throw new Error('NOT_FOUND')

      const { rows: crows } = await c.query(
        'select state from task_progress where user_id=$1 and task_id=$2',
        [userId, taskId]
      )
      const claimed = crows[0]?.state === 'claimed'
      if (claimed) return { ready: false, claimed: true, lastClickAt: null, clicks: 0 }

      const { rows: erows } = await c.query(
        `select created_at from ad_events
          where user_id=$1 and status='completed' and (reward_payload->>'intent')=$2
          order by created_at desc limit 1`,
        [userId, `task:${taskId}`]
      )
      const ready = !!erows[0]
      const lastClickAt = erows[0]?.created_at || null

      // optional clicks count for debug
      const { rows: cnt } = await c.query(
        `select count(1) as n from ad_events where user_id=$1 and status='completed' and (reward_payload->>'intent')=$2`,
        [userId, `task:${taskId}`]
      )
      const clicks = Number(cnt[0]?.n || 0)

      return { ready, claimed: false, lastClickAt, clicks }
    })

    return NextResponse.json(data)
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    if (msg.includes('NOT_FOUND')) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}
