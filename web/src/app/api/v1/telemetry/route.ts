export const runtime = 'nodejs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

type TelemetryPayload = {
  name?: string
  data?: Record<string, unknown>
  ts?: number
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('dev_session')?.value || null
    const p = (await req.json().catch(() => ({}))) as TelemetryPayload
    const name = typeof p?.name === 'string' ? p.name : 'unknown'
    const data = (p?.data && typeof p.data === 'object' ? p.data : {}) as Record<string, unknown>
    const ts = Number.isFinite(p?.ts as number) ? (p?.ts as number) : Date.now()

    try {
      // Log to server stdout for Vercel collection
      console.log(
        JSON.stringify({
          event: 'telemetry',
          name,
          ts,
          userId: userId ? String(userId).slice(0, 8) : null,
          ua: req.headers.get('user-agent') || undefined,
          data,
        })
      )
    } catch {}

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}


