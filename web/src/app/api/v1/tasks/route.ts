export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../lib/db'

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const data = await withClient(async (c) => {
    const defs = await c.query(
      'select task_id as "taskId", unlock_level as "unlockLevel", kind, reward_payload as "rewardPayload", verification from task_definitions where active=true order by unlock_level'
    )
    const prog = await c.query(
      'select task_id as "taskId", state, claimed_at as "claimedAt" from task_progress where user_id=$1',
      [userId]
    )
    const lvl = await c.query('select level from user_counters where user_id=$1', [userId])
    const userLevel = Number(lvl.rows[0]?.level || 0)

    const progressByTaskId = new Map<string, { taskId: string; state: string; claimedAt: string | null }>()
    for (const p of prog.rows as { taskId: string; state: string; claimedAt: string | null }[]) {
      progressByTaskId.set(p.taskId, p)
    }

    const definitions = (defs.rows as { taskId: string; unlockLevel: number; kind: string; rewardPayload: unknown; verification: string }[]).map(
      (d) => {
        const p = progressByTaskId.get(d.taskId)
        const state = p?.state === 'claimed' ? 'claimed' : d.unlockLevel <= userLevel ? 'available' : 'locked'
        return { ...d, state }
      }
    )

    return { definitions, progress: prog.rows, userLevel }
  })

  return NextResponse.json(data)
}
