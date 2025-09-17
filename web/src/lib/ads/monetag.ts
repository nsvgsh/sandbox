'use client'

export type MonetagResult = {
  reward_event_type?: 'valued' | 'not_valued'
  estimated_price?: number
  sub_zone_id?: number
  zone_id?: number
  request_var?: string
  ymid?: string
  telegram_id?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

function getDefaultGlobalName(zoneId: string): string {
  return `show_${zoneId}`
}

function resolveGlobalName(zoneId: string, explicitName?: string): string {
  return explicitName && explicitName.trim().length > 0 ? explicitName : getDefaultGlobalName(zoneId)
}

export function isMonetagLoaded(zoneId: string, sdkFunctionName?: string): boolean {
  if (typeof window === 'undefined') return false
  const fnName = resolveGlobalName(zoneId, sdkFunctionName)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any)[fnName] === 'function'
}

export async function loadMonetagSdk(params: { sdkUrl: string; zoneId: string; sdkFunctionName?: string }): Promise<void> {
  const { sdkUrl, zoneId, sdkFunctionName } = params
  if (typeof document === 'undefined') return
  if (!zoneId || zoneId === 'MAIN_ZONE_ID') throw new Error('invalid_zone_id')
  if (isMonetagLoaded(zoneId, sdkFunctionName)) return

  const desiredFnName = resolveGlobalName(zoneId, sdkFunctionName)

  const existing = Array.from(document.getElementsByTagName('script')).find((s) => {
    return (
      s.getAttribute('src')?.includes('sdk.js') &&
      (s.getAttribute('data-zone') === zoneId || s.getAttribute('data-sdk') === desiredFnName)
    )
  })
  if (existing) return

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    // cache-bust to avoid stale disk cache during dev
    const cacheBustedUrl = sdkUrl.includes('?') ? `${sdkUrl}&v=${Date.now()}` : `${sdkUrl}?v=${Date.now()}`
    script.src = cacheBustedUrl
    script.async = true
    script.setAttribute('data-zone', zoneId)
    script.setAttribute('data-sdk', desiredFnName)
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('sdk_load_error'))
    document.head.appendChild(script)
  })
}

export async function ensureMonetagReady(config: {
  sdkUrl: string
  zoneId: string
  sdkFunctionName?: string
  waitMs?: number
  pollMs?: number
}): Promise<void> {
  const { sdkUrl, zoneId, sdkFunctionName, waitMs = 4000, pollMs = 50 } = config
  await loadMonetagSdk({ sdkUrl, zoneId, sdkFunctionName })
  const startedAt = Date.now()
  while (!isMonetagLoaded(zoneId, sdkFunctionName)) {
    if (Date.now() - startedAt > waitMs) throw new Error('sdk_not_loaded')
    await new Promise((r) => setTimeout(r, pollMs))
  }
}

export async function preloadMonetag(
  zoneId: string,
  opts: { ymid?: string; requestVar?: string; timeoutSec?: number; sdkFunctionName?: string }
): Promise<MonetagResult> {
  if (!isMonetagLoaded(zoneId, opts.sdkFunctionName)) throw new Error('sdk_not_loaded')
  const fnName = resolveGlobalName(zoneId, opts.sdkFunctionName)
  const fn = (window as unknown as Record<string, unknown>)[fnName] as (arg?: unknown) => Promise<MonetagResult>
  const timeout = typeof opts.timeoutSec === 'number' ? opts.timeoutSec : 5
  return await fn({ type: 'preload', timeout, ymid: opts.ymid, requestVar: opts.requestVar, catchIfNoFeed: true })
}

export async function showRewardedInterstitial(
  zoneId: string,
  opts: { ymid?: string; requestVar?: string; sdkFunctionName?: string }
): Promise<MonetagResult> {
  if (!isMonetagLoaded(zoneId, opts.sdkFunctionName)) throw new Error('sdk_not_loaded')
  const fnName = resolveGlobalName(zoneId, opts.sdkFunctionName)
  const fn = (window as unknown as Record<string, unknown>)[fnName] as (arg?: unknown) => Promise<MonetagResult>
  return await fn({ type: 'end', ymid: opts.ymid, requestVar: opts.requestVar, catchIfNoFeed: true })
}

export function categorizeMonetagError(err: unknown):
  | 'no_feed'
  | 'sdk_not_loaded'
  | 'timeout'
  | 'popup_blocked'
  | 'cors'
  | 'bad_request'
  | 'unknown' {
  const msg = typeof err === 'string' ? err : err && typeof (err as { message?: string }).message === 'string' ? (err as { message: string }).message : ''
  const lower = msg.toLowerCase()
  if (lower.includes('no feed') || lower.includes('feed is empty')) return 'no_feed'
  if (lower.includes('timeout')) return 'timeout'
  if (lower.includes('popup') || lower.includes('blocked')) return 'popup_blocked'
  if (lower.includes('sdk_not_loaded')) return 'sdk_not_loaded'
  if (lower.includes('cors')) return 'cors'
  if (lower.includes('400') || lower.includes('bad request')) return 'bad_request'
  return 'unknown'
}




