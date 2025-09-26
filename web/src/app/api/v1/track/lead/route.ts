export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { withClient } from '../../../../../lib/db'
import { parseStartParam } from '../../../../../lib/partners/propeller'

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { userId?: string; start?: string }
  const userId = typeof body.userId === 'string' ? body.userId : undefined
  const start = typeof body.start === 'string' ? body.start : undefined
  if (!userId) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const parsed = parseStartParam(start)
  if (parsed.provider !== 'propellerads' || !parsed.subid) {
    return NextResponse.json({ recorded: false })
  }

  await withClient(async (c) => {
    await c.query(
      'insert into attribution_leads(user_id, campaign_id, meta) values ($1,$2,$3) on conflict (user_id) do update set meta = excluded.meta, campaign_id = excluded.campaign_id',
      [userId, parsed.campaignid || null, JSON.stringify({ provider: 'propellerads', ...parsed })]
    )
  })
  return NextResponse.json({ recorded: true })
}


