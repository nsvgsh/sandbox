export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../../../../lib/db'
import { randomUUID } from 'crypto'

function buildRedirectUrl(template: string, clickId: string, source: string): string {
  const url = template
    .replace('{CLICKID}', encodeURIComponent(clickId))
    .replace('{SOURCE}', encodeURIComponent(source))
  return url
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('dev_session')?.value
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const url = new URL(req.url)
    const parts = url.pathname.split('/').filter(Boolean)
    // .../api/v1/offer/free-trial/level/{level}/modal-redirect
    const i = parts.findIndex((p) => p === 'level')
    const levelStr = i >= 0 && parts[i + 1] ? parts[i + 1] : ''
    const level = Number(levelStr)
    if (!Number.isFinite(level) || level <= 0) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

    const result = await withClient(async (c) => {
      // validate there is an active schedule for this level
      const { rows: sched } = await c.query(
        `select level, active, partner_key
           from level_offer_schedule
          where level=$1 and active=true and partner_key='free_trial'
          limit 1`,
        [level]
      )
      if (!sched[0]) throw new Error('NOT_FOUND')

      // read config
      const tplq = await c.query("select value from game_config where key='free_trial_url_template'")
      const srcq = await c.query("select value from game_config where key='free_trial_source'")
      const template = String(tplq.rows[0]?.value || '').replace(/^"|"$/g, '')
      const source = String(srcq.rows[0]?.value || '').replace(/^"|"$/g, '')
      if (!template || !source) throw new Error('CONFIG_MISSING')

      const clickId = randomUUID()
      const finalUrl = buildRedirectUrl(template, clickId, source)

      // Allow only himfls.com
      let parsed: URL
      try { parsed = new URL(finalUrl) } catch { throw new Error('BAD_TEMPLATE') }
      if (!parsed.hostname.endsWith('himfls.com')) throw new Error('HOST_RESTRICTED')

      // Record ad-like event for MODAL placement (non-claimable, no task intent)
      await c.query(
        'insert into ad_events(id, user_id, session_id, provider, placement, status, reward_payload) values (gen_random_uuid(), $1, null, $2, $3, $4, $5)',
        [userId, 'free_trial', 'level_up_modal', 'completed', JSON.stringify({ impressionId: clickId, level })]
      )

      return { url: finalUrl }
    })

    return NextResponse.redirect(result.url, { status: 302 })
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e)
    if (msg.includes('NOT_FOUND')) return NextResponse.json({ code: 'NOT_FOUND' }, { status: 404 })
    if (msg.includes('CONFIG_MISSING')) return NextResponse.json({ code: 'CONFIG_MISSING' }, { status: 503 })
    if (msg.includes('HOST_RESTRICTED')) return NextResponse.json({ code: 'HOST_RESTRICTED' }, { status: 400 })
    if (msg.includes('BAD_TEMPLATE')) return NextResponse.json({ code: 'BAD_TEMPLATE' }, { status: 400 })
    return NextResponse.json({ error: 'server_error' }, { status: 500 })
  }
}


