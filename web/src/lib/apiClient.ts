export type CountersNormalized = {
  coins: number
  tickets: number
  coinMultiplier: number
  level: number
  totalTaps: number
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function normalizeCounters(input: unknown): CountersNormalized {
  const c: Record<string, unknown> = (typeof input === 'object' && input !== null) ? (input as Record<string, unknown>) : {}
  return {
    coins: toNumber(c['coins'], 0),
    tickets: toNumber(c['tickets'], 0),
    coinMultiplier: toNumber(c['coinMultiplier'] ?? c['coin_multiplier'], 1),
    level: toNumber(c['level'], 0),
    totalTaps: toNumber(c['totalTaps'] ?? c['total_taps'], 0),
  }
}

export type PublicConfig = {
  adTTLSeconds: number
  batchMinIntervalMs: number
  tapAggFlushThreshold?: number
  tapAggTweenMsMin?: number
  tapAggTweenMsMax?: number
  coinsPerTap?: number
  hudTweenMs?: number
  monetagEnabled?: boolean
  monetagZoneId?: string
  monetagSdkUrl?: string
  unlockPolicy?: 'any' | 'valued'
  logFailedAdEvents?: boolean
}

export function parsePublicConfig(obj: Record<string, unknown>): PublicConfig {
  // obj is key->value map from /v1/config
  const adTTLRaw = obj['ad_ttl_seconds']
  const adTTL = typeof adTTLRaw === 'number' ? adTTLRaw : Number(adTTLRaw ?? 180)
  const thresholds = (typeof obj['thresholds'] === 'object' && obj['thresholds'] !== null ? obj['thresholds'] as Record<string, unknown> : {})
  const batchRaw = thresholds['batch_min_interval_ms']
  const batchMs = typeof batchRaw === 'number' ? batchRaw : Number(batchRaw ?? 100)
  const cptRaw = obj['coins_per_tap']
  const coinsPerTap = typeof cptRaw === 'number' ? cptRaw : Number(cptRaw ?? 1)
  const hudTweenRaw = obj['hud_tween_ms']
  const hudTweenMs = typeof hudTweenRaw === 'number' ? hudTweenRaw : Number(hudTweenRaw ?? 160)
  const tapAgg = (typeof obj['tap_agg'] === 'object' && obj['tap_agg'] !== null ? obj['tap_agg'] as Record<string, unknown> : {})
  const flushTh = typeof tapAgg['flush_threshold'] === 'number' ? (tapAgg['flush_threshold'] as number) : Number(tapAgg['flush_threshold'] ?? 20)
  const tweenMin = typeof tapAgg['tween_ms_min'] === 'number' ? (tapAgg['tween_ms_min'] as number) : Number(tapAgg['tween_ms_min'] ?? 80)
  const tweenMax = typeof tapAgg['tween_ms_max'] === 'number' ? (tapAgg['tween_ms_max'] as number) : Number(tapAgg['tween_ms_max'] ?? 180)
  const monetagEnabled = Boolean(obj['monetag_enabled'] ?? false)
  const monetagZoneId = typeof obj['monetag_zone_id'] === 'string' ? (obj['monetag_zone_id'] as string) : undefined
  const monetagSdkUrl = typeof obj['monetag_sdk_url'] === 'string' ? (obj['monetag_sdk_url'] as string) : undefined
  const unlockPolicyRaw = obj['unlock_policy']
  const unlockPolicy = unlockPolicyRaw === 'valued' ? 'valued' : 'any'
  const logFailedAdEvents = Boolean(obj['log_failed_ad_events'] ?? true)
  return {
    adTTLSeconds: Number.isFinite(adTTL) ? adTTL : 180,
    batchMinIntervalMs: Number.isFinite(batchMs) ? batchMs : 100,
    tapAggFlushThreshold: Number.isFinite(flushTh) ? flushTh : 20,
    tapAggTweenMsMin: Number.isFinite(tweenMin) ? tweenMin : 80,
    tapAggTweenMsMax: Number.isFinite(tweenMax) ? tweenMax : 180,
    coinsPerTap: Number.isFinite(coinsPerTap) ? coinsPerTap : 1,
    hudTweenMs: Number.isFinite(hudTweenMs) ? hudTweenMs : 160,
    monetagEnabled,
    monetagZoneId,
    monetagSdkUrl,
    unlockPolicy,
    logFailedAdEvents,
  }
}

export async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export type RetryOpts = {
  onOutdated?: () => Promise<void>
  retry429DelayMs?: number
}

export async function fetchJsonWithRetry<T = unknown>(url: string, init: RequestInit, opts: RetryOpts = {}): Promise<{ ok: boolean; status: number; json: T | null }> {
  let tried429 = false
  let tried409 = false
  let triedNet = false
  async function once(): Promise<{ ok: boolean; status: number; json: T | null }> {
    try {
      const res = await fetch(url, init)
      const status = res.status
      const json = await res.json().catch(() => null) as T | null
      if (res.ok) return { ok: true, status, json }
      // 429 Too fast
      if (status === 429 && !tried429) {
        tried429 = true
        const wait = typeof opts.retry429DelayMs === 'number' && Number.isFinite(opts.retry429DelayMs) ? opts.retry429DelayMs : 200
        try { console.log(JSON.stringify({ event: 'TooFastRetry', url, wait })) } catch {}
        await delay(wait)
        return await once()
      }
      // 409 Out of date
      if (status === 409 && !tried409 && typeof opts.onOutdated === 'function') {
        tried409 = true
        try { console.log(JSON.stringify({ event: 'OutOfDateRefresh', url })) } catch {}
        await opts.onOutdated()
        return await once()
      }
      return { ok: false, status, json }
    } catch {
      if (!triedNet) {
        triedNet = true
        try { console.log(JSON.stringify({ event: 'NetRetry', url })) } catch {}
        await delay(150)
        return await once()
      }
      return { ok: false, status: 0, json: null }
    }
  }
  return await once()
}

