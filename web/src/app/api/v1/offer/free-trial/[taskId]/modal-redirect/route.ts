export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../../../lib/db'
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
    // .../api/v1/offer/free-trial/{taskId}/modal-redirect
    const i = parts.findIndex((p) => p === 'free-trial')
    const taskId = i >= 0 && parts[i + 1] ? parts[i + 1] : ''
    if (!taskId) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

    const result = await withClient(async (c) => {
      // validate task is partner free_trial and active
      const { rows: taskRows } = await c.query(
        `select d.task_id as "taskId", d.unlock_level as "unlockLevel", d.active,
                s.partner_key as "partnerKey"
           from task_definitions d
           join level_offer_schedule s on s.task_id = d.task_id
          where d.task_id=$1 and d.kind='partner' and s.partner_key='free_trial' and d.active=true and s.active=true`,
        [taskId]
      )
      if (!taskRows[0]) throw new Error('NOT_FOUND')

      // read config: optional variants + fallback
      const vlistQ = await c.query("select value from game_config where key='free_trial_variants'")
      const tplq = await c.query("select value from game_config where key='free_trial_url_template'")
      const srcq = await c.query("select value from game_config where key='free_trial_source'")
      const rawVariants = (vlistQ.rows[0]?.value ?? null) as unknown
      const variants: Array<{ id: string; url_template: string; allowed_hosts?: string[]; source?: string }> = Array.isArray(rawVariants) ? (rawVariants as any[]) : []
      const fallbackTemplate = String(tplq.rows[0]?.value || '').replace(/^"|"$/g, '')
      const fallbackSource = String(srcq.rows[0]?.value || '').replace(/^"|"$/g, '')
      if (!fallbackTemplate || !fallbackSource) throw new Error('CONFIG_MISSING')

      const variantId = (new URL(req.url)).searchParams.get('variant') || ''
      const clickId = randomUUID()
      const selected = variants.find((v) => String(v?.id || '') === variantId)
      let finalUrl: string
      if (selected && typeof selected.url_template === 'string' && selected.url_template) {
        const useSource = typeof selected.source === 'string' && selected.source ? selected.source : fallbackSource
        finalUrl = buildRedirectUrl(selected.url_template, clickId, useSource)
        let parsed: URL
        try { parsed = new URL(finalUrl) } catch { finalUrl = '' }
        const hosts = Array.isArray(selected.allowed_hosts) ? selected.allowed_hosts : []
        if (!finalUrl || hosts.length === 0 || !hosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h))) {
          finalUrl = buildRedirectUrl(fallbackTemplate, clickId, fallbackSource)
        }
      } else {
        finalUrl = buildRedirectUrl(fallbackTemplate, clickId, fallbackSource)
      }

      // Safety host enforcement (accept legacy himfls.com or x.trc85.com)
      let parsed: URL
      try { parsed = new URL(finalUrl) } catch { throw new Error('BAD_TEMPLATE') }
      const isHimfls = parsed.hostname.endsWith('himfls.com')
      const accepted = isHimfls || parsed.hostname.endsWith('x.trc85.com')
      if (!accepted) throw new Error('HOST_RESTRICTED')

      // Record ad-like event for MODAL placement (non-claimable, no intent)
      await c.query(
        'insert into ad_events(id, user_id, session_id, provider, placement, status, reward_payload) values (gen_random_uuid(), $1, null, $2, $3, $4, $5)',
        [userId, 'free_trial', 'level_up_modal', 'completed', JSON.stringify({ impressionId: clickId })]
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


