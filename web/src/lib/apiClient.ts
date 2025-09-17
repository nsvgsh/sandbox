export type CountersNormalized = {
  coins: number
  tickets: number
  coinMultiplier: number
  level: number
  totalTaps: number
}

export function normalizeCounters(input: unknown): CountersNormalized {
  const c = (typeof input === 'object' && input !== null ? input as Record<string, unknown> : {})
  return {
    coins: Number((c as any).coins || 0),
    tickets: Number((c as any).tickets || 0),
    coinMultiplier: Number((c as any).coinMultiplier ?? (c as any).coin_multiplier ?? 1),
    level: Number((c as any).level || 0),
    totalTaps: Number((c as any).totalTaps ?? (c as any).total_taps ?? 0),
  }
}

export type PublicConfig = {
  adTTLSeconds: number
  batchMinIntervalMs: number
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
  const thresholds = (obj['thresholds'] as Record<string, unknown>) || {}
  const batchRaw = thresholds?.['batch_min_interval_ms']
  const batchMs = typeof batchRaw === 'number' ? batchRaw : Number(batchRaw ?? 100)
  const monetagEnabled = Boolean(obj['monetag_enabled'] ?? false)
  const monetagZoneId = typeof obj['monetag_zone_id'] === 'string' ? (obj['monetag_zone_id'] as string) : undefined
  const monetagSdkUrl = typeof obj['monetag_sdk_url'] === 'string' ? (obj['monetag_sdk_url'] as string) : undefined
  const unlockPolicyRaw = obj['unlock_policy']
  const unlockPolicy = unlockPolicyRaw === 'valued' ? 'valued' : 'any'
  const logFailedAdEvents = Boolean(obj['log_failed_ad_events'] ?? true)
  return {
    adTTLSeconds: Number.isFinite(adTTL) ? adTTL : 180,
    batchMinIntervalMs: Number.isFinite(batchMs) ? batchMs : 100,
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

