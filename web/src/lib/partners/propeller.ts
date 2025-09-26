import { type PoolClient } from 'pg'

export type PropellerConfig = {
  enabled: boolean
  baseUrl: string
  aid: string
  tid: string
  pid?: string
}

export type ParsedStart = {
  provider: 'propellerads' | 'unknown'
  subid?: string
  campaignid?: string
  zoneid?: string
}

function toBool(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

function toStr(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (value == null) return fallback
  return String(value)
}

function stripJsonQuotes(s: string): string {
  return s.replace(/^"|"$/g, '')
}

export async function getPropellerConfig(c: PoolClient): Promise<PropellerConfig> {
  const { rows } = await c.query<{ key: string; value: unknown }>(
    "select key, value from game_config where key in ('propeller_enabled','propeller_postback_base_url','propeller_aid','propeller_tid','propeller_pid')"
  )
  const map = new Map<string, unknown>(rows.map((r) => [r.key, r.value]))
  const enabledRaw = map.get('propeller_enabled')
  const baseUrlRaw = map.get('propeller_postback_base_url')
  const aidRaw = map.get('propeller_aid')
  const tidRaw = map.get('propeller_tid')
  const pidRaw = map.get('propeller_pid')
  return {
    enabled: toBool(enabledRaw),
    baseUrl: stripJsonQuotes(toStr(baseUrlRaw, 'http://ad.propellerads.com/conversion.php')),
    aid: stripJsonQuotes(toStr(aidRaw, '')),
    tid: stripJsonQuotes(toStr(tidRaw, '')),
    pid: stripJsonQuotes(toStr(pidRaw, '')) || undefined,
  }
}

export function parseStartAppParam(startapp?: string): ParsedStart {
  if (!startapp || typeof startapp !== 'string') return { provider: 'unknown' }
  // Enforce 64-char max by trimming from the end, preserving SUBID at the front
  let s = startapp
  if (s.length > 64) s = s.slice(0, 64)
  const parts = s.split('_')
  const [subid, campaignid, zoneid, sentinel] = parts
  if (!subid || sentinel !== 'prop') return { provider: 'unknown' }
  return { provider: 'propellerads', subid, campaignid, zoneid }
}

export function buildPostbackUrl(cfg: PropellerConfig, subid: string, goal?: number): string {
  const url = new URL(cfg.baseUrl)
  if (cfg.aid) url.searchParams.set('aid', cfg.aid)
  if (cfg.tid) url.searchParams.set('tid', cfg.tid)
  if (cfg.pid) url.searchParams.set('pid', cfg.pid)
  url.searchParams.set('visitor_id', subid)
  if (goal && Number.isFinite(goal)) url.searchParams.set('goal', String(goal))
  return url.toString()
}

export async function recordAndSendPostback(
  c: PoolClient,
  userId: string,
  subid: string,
  url: string,
  goal?: number
): Promise<{ sent: boolean; httpCode?: number }> {
  // Dedupe by (user_id, provider, goal)
  const provider = 'propellerads'
  await c.query(
    'insert into partner_postbacks(user_id, provider, subid, goal, url, status, attempts) values ($1,$2,$3,$4,$5,$6,$7) on conflict (user_id, provider, goal) do nothing',
    [userId, provider, subid, goal ?? null, url, 'pending', 0]
  )

  // Attempt HTTP send (best-effort, short timeout)
  const ctrl = new AbortController()
  const to = setTimeout(() => ctrl.abort(), 2000)
  try {
    const res = await fetch(url, { method: 'GET', signal: ctrl.signal })
    clearTimeout(to)
    const httpCode = res.status
    await c.query(
      'update partner_postbacks set status=$1, http_code=$2, attempts=attempts+1, sent_at=now() where user_id=$3 and provider=$4 and goal is not distinct from $5',
      [res.ok ? 'sent' : 'failed', httpCode, userId, provider, goal ?? null]
    )
    return { sent: res.ok, httpCode }
  } catch (e) {
    clearTimeout(to)
    await c.query(
      'update partner_postbacks set status=$1, attempts=attempts+1 where user_id=$2 and provider=$3 and goal is not distinct from $4',
      ['failed', userId, provider, goal ?? null]
    )
    return { sent: false }
  }
}

export async function maybeSendFirstConversion(
  c: PoolClient,
  userId: string
): Promise<{ attempted: boolean; sent?: boolean }> {
  const cfg = await getPropellerConfig(c)
  if (!cfg.enabled || !cfg.aid || !cfg.tid) return { attempted: false }

  const { rows: attr } = await c.query<{ meta: unknown }>(
    "select meta from attribution_leads where user_id=$1 and (meta->>'provider')='propellerads'",
    [userId]
  )
  if (!attr.length) return { attempted: false }

  const meta = attr[0]?.meta
  const getMetaString = (m: unknown, key: string): string | undefined => {
    if (m && typeof m === 'object') {
      const v = (m as Record<string, unknown>)[key]
      if (typeof v === 'string') return v
    }
    return undefined
  }
  const subid = getMetaString(meta, 'subid') || getMetaString(meta, 'SUBID') || getMetaString(meta, 'click_id')
  if (!subid) return { attempted: false }

  // Check if already sent (dedupe)
  const { rows: existing } = await c.query(
    'select 1 from partner_postbacks where user_id=$1 and provider=$2 and goal is null limit 1',
    [userId, 'propellerads']
  )
  if (existing.length) return { attempted: false }

  const url = buildPostbackUrl(cfg, subid)
  const { sent } = await recordAndSendPostback(c, userId, subid, url)
  return { attempted: true, sent }
}


