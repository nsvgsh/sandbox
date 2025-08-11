export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { withClient } from '../../../../lib/db'

export async function GET() {
  const rows: { key: string; value: unknown }[] = await withClient(async (c) => {
    const { rows } = await c.query('select key, value from game_config')
    return rows as { key: string; value: unknown }[]
  })
  const obj: Record<string, unknown> = {}
  for (const r of rows) obj[r.key] = r.value
  return NextResponse.json(obj)
}
