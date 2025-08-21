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

function getGlobalName(zoneId: string): string {
  return `show_${zoneId}`
}

export function isMonetagLoaded(zoneId: string): boolean {
  if (typeof window === 'undefined') return false
  const fnName = getGlobalName(zoneId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (window as any)[fnName] === 'function'
}

export async function loadMonetagSdk(params: { sdkUrl: string; zoneId: string }): Promise<void> {
  const { sdkUrl, zoneId } = params
  if (typeof document === 'undefined') return
  if (isMonetagLoaded(zoneId)) return
  const existing = Array.from(document.getElementsByTagName('script')).find((s) => {
    return s.getAttribute('data-zone') === zoneId || s.getAttribute('data-sdk') === getGlobalName(zoneId)
  })
  if (existing) return
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = sdkUrl
    script.async = true
    script.setAttribute('data-zone', zoneId)
    script.setAttribute('data-sdk', getGlobalName(zoneId))
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('sdk_load_error'))
    document.head.appendChild(script)
  })
}

export async function showRewardedInterstitial(zoneId: string, opts: { ymid?: string; requestVar?: string }): Promise<MonetagResult> {
  if (!isMonetagLoaded(zoneId)) throw new Error('sdk_not_loaded')
  const fnName = getGlobalName(zoneId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fn = (window as any)[fnName] as (arg?: unknown) => Promise<MonetagResult>
  return await fn({ type: 'end', ymid: opts.ymid, requestVar: opts.requestVar, catchIfNoFeed: true })
}

export function categorizeMonetagError(err: unknown): 'no_feed' | 'sdk_not_loaded' | 'timeout' | 'popup_blocked' | 'unknown' {
  const msg = typeof err === 'string' ? err : err && typeof (err as any).message === 'string' ? (err as any).message : ''
  if (msg.includes('no feed') || msg.includes('feed is empty')) return 'no_feed'
  if (msg.includes('timeout')) return 'timeout'
  if (msg.includes('popup') || msg.includes('blocked')) return 'popup_blocked'
  if (msg.includes('sdk_not_loaded')) return 'sdk_not_loaded'
  return 'unknown'
}




