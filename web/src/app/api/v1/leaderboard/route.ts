export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../lib/db'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const top = Number(url.searchParams.get('top') || 10)
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value || null
  const data = await withClient(async (c) => {
    const topRows = await c.query('select user_id as "userId", level from leaderboard_global order by level desc limit $1', [top])
    let me: { userId: string; level: number; rank: number } | null = null
    let activePlayers: number | null = null
    if (userId) {
      const meRow = await c.query('select level from leaderboard_global where user_id=$1', [userId])
      const myLevel = Number(meRow.rows[0]?.level || 0)
      const rankRow = await c.query('select 1 + count(*) as rank from leaderboard_global where level > $1', [myLevel])
      me = { userId, level: myLevel, rank: Number(rankRow.rows[0]?.rank || 0) }
    }
    const activeDays = Number(process.env.NEXT_PUBLIC_LEADERBOARD_ACTIVE_WINDOW_DAYS || 1)
    const activeRow = await c.query('select count(*)::int as cnt from leaderboard_global where updated_at >= now() - make_interval(days => $1)', [activeDays])
    activePlayers = Number(activeRow.rows[0]?.cnt || 0)
    return { top: topRows.rows, me, activePlayers }
  })
  return NextResponse.json(data)
}
