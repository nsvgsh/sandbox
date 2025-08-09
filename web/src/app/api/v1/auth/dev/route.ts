import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const expected = process.env.DEV_TOKEN
  const provided = req.headers.get('x-dev-token') || req.headers.get('dev-token')
  if (!expected || !provided || expected !== provided) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const userId = randomUUID()
  const cookieStore = await cookies()
  cookieStore.set('dev_session', userId, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' })
  return NextResponse.json({ userId })
}
