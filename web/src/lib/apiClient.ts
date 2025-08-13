export type CountersNormalized = {
  coins: number
  tickets: number
  coinMultiplier: number
  level: number
  totalTaps: number
}

export function normalizeCounters(input: any): CountersNormalized {
  const c = input || {}
  return {
    coins: Number(c.coins || 0),
    tickets: Number(c.tickets || 0),
    coinMultiplier: Number(c.coinMultiplier ?? c.coin_multiplier ?? 1),
    level: Number(c.level || 0),
    totalTaps: Number(c.totalTaps ?? c.total_taps ?? 0),
  }
}

export type PublicConfig = {
  adTTLSeconds: number
  batchMinIntervalMs: number
}

export function parsePublicConfig(obj: Record<string, unknown>): PublicConfig {
  // obj is key->value map from /v1/config
  const adTTL = Number((obj['ad_ttl_seconds'] as any) ?? 180)
  const thresholds = (obj['thresholds'] as any) || {}
  const batchMs = Number((thresholds?.batch_min_interval_ms as any) ?? 100)
  return {
    adTTLSeconds: Number.isFinite(adTTL) ? adTTL : 180,
    batchMinIntervalMs: Number.isFinite(batchMs) ? batchMs : 100,
  }
}

export async function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export type RetryOpts = {
  onOutdated?: () => Promise<void>
  retry429DelayMs?: number
}

export async function fetchJsonWithRetry<T = any>(url: string, init: RequestInit, opts: RetryOpts = {}): Promise<{ ok: boolean; status: number; json: T | any | null }> {
  let tried429 = false
  let tried409 = false
  let triedNet = false
  async function once(): Promise<{ ok: boolean; status: number; json: T | any | null }> {
    try {
      const res = await fetch(url, init)
      const status = res.status
      const json = await res.json().catch(() => null)
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

