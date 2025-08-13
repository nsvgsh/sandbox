export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../../lib/db'

export async function GET(req: NextRequest) {
  const token = req.headers.get('x-dev-token') || ''
  if (!process.env.DEV_TOKEN || token !== process.env.DEV_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const userId = req.headers.get('x-user-id') || ''
  if (!userId) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const data = await withClient(async (c) => {
    const counters = await c.query('select * from user_counters where user_id=$1', [userId])
    const lastLevel = await c.query('select * from level_events where user_id=$1 order by created_at desc limit 1', [userId])
    const board = await c.query('select * from leaderboard_global where user_id=$1', [userId])
    const config = await c.query("select key, value from game_config where key in ('thresholds','claim_ttl_seconds','ad_ttl_seconds','level_bonus_policy','coins_per_tap')")

    const currentLevel = Number(counters.rows[0]?.level || 0)
    const levelsToPreview = [currentLevel + 1, currentLevel + 2, currentLevel + 3]
    const nextTemplates: { level: number; templateId: string | null; payload: unknown }[] = []
    for (const L of levelsToPreview) {
      const tpl = await c.query(
        'select template_id as "templateId", payload from level_reward_templates where active=true and level=$1 order by updated_at desc limit 1',
        [L]
      )
      if (tpl.rows[0]) {
        nextTemplates.push({ level: L, templateId: tpl.rows[0].templateId, payload: tpl.rows[0].payload })
      } else {
        const def = await c.query(
          'select template_id as "templateId", payload from level_reward_templates where active=true and level=0 order by updated_at desc limit 1'
        )
        nextTemplates.push({ level: L, templateId: def.rows[0]?.templateId || null, payload: def.rows[0]?.payload || null })
      }
    }

    return {
      counters: counters.rows[0] || null,
      lastLevel: lastLevel.rows[0] || null,
      leaderboard: board.rows[0] || null,
      config: config.rows,
      nextTemplates,
    }
  })
  return NextResponse.json(data)
}
