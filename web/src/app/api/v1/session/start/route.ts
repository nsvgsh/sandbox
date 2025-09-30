export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { withClient } from '../../../../../lib/db'
import { maybeSendFirstConversion, parseStartAppParam } from '../../../../../lib/partners/propeller'

export async function POST() {
  const corr = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)) as string
  const cookieStore = await cookies()
  let userId = cookieStore.get('dev_session')?.value
  if (!userId) {
    // Dev header fallback for Telegram Web (3PC blocked)
    const headersList = (await import('next/headers')).headers
    const reqHeaders = await headersList()
    const devToken = reqHeaders.get('x-dev-token')
    const providedUser = reqHeaders.get('x-user-id')
    const expected = process.env.DEV_TOKEN
    if (expected && devToken === expected && providedUser) {
      userId = providedUser
    }
  }
  if (!userId) {
    try { console.log(JSON.stringify({ event: 'session_start_unauthorized', corr })) } catch {}
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // Capture optional startapp passed from client
  let startapp: string | undefined
  try {
    const headersList = (await import('next/headers')).headers
    const reqHeaders = await headersList()
    const fromHeader = reqHeaders.get('x-startapp') || undefined
    if (fromHeader && typeof fromHeader === 'string') startapp = fromHeader
  } catch {}

  const row = await withClient(async (c) => {
    const { rows } = await c.query('select * from session_start($1)', [userId])
    // Persist attribution if provided via header/body
    try {
      if (!startapp) {
        // also support JSON body { startapp }
        const { headers } = await import('next/headers')
        const h = await headers()
        const contentType = h.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const getReq = await import('next/server')
          // next/server does not expose req body here; skip silently in this runtime
        }
      }
      if (startapp) {
        const parsed = parseStartAppParam(startapp)
        if (parsed.provider === 'propellerads' && parsed.subid) {
          await c.query(
            'insert into attribution_leads(user_id, campaign_id, meta) values ($1,$2,$3) on conflict (user_id) do update set meta = excluded.meta, campaign_id = excluded.campaign_id',
            [userId, parsed.campaignid || null, JSON.stringify(parsed)]
          )
        }
      }
    } catch {}
    // Best-effort: attempt PropellerAds first conversion postback if attributed
    try {
      await maybeSendFirstConversion(c, userId!)
    } catch {}
    return rows[0]
  })

  const payload = { sessionId: row.session_id, sessionEpoch: row.session_epoch, lastAppliedSeq: row.last_applied_seq }
  try { console.log(JSON.stringify({ event: 'session_start_ok', corr, userId: String(userId).slice(0, 8), sessionId: payload.sessionId, sessionEpoch: payload.sessionEpoch, startapp: typeof startapp === 'string' ? startapp : undefined })) } catch {}
  return NextResponse.json(payload)
}
