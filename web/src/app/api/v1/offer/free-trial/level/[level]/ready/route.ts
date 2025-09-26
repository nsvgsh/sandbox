export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../../../../lib/db'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const parts = url.pathname.split('/').filter(Boolean)
    // .../api/v1/offer/free-trial/level/{level}/ready
    const i = parts.findIndex((p) => p === 'level')
    const levelStr = i >= 0 && parts[i + 1] ? parts[i + 1] : ''
    const level = Number(levelStr)
    if (!Number.isFinite(level) || level <= 0) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

    const data = await withClient(async (c) => {
      const { rows: sched } = await c.query(
        `select level, active, partner_key, task_id from level_offer_schedule where level=$1 and active=true and partner_key='free_trial' limit 1`,
        [level]
      )
      if (!sched[0]) return { ready: false }

      const tplq = await c.query("select value from game_config where key='free_trial_url_template'")
      const srcq = await c.query("select value from game_config where key='free_trial_source'")
      const template = String(tplq.rows[0]?.value || '').replace(/^"|"$/g, '')
      const source = String(srcq.rows[0]?.value || '').replace(/^"|"$/g, '')
      if (!template || !source) return { ready: false }

      return { ready: true, taskId: String(sched[0].task_id) }
    })

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}


