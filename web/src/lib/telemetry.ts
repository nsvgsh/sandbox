export type TelemetryEvent = {
  name: string
  data?: Record<string, unknown>
}

let buffer: Array<{ name: string; data?: Record<string, unknown>; ts: number }> = []
let flushing = false
let backoffMs = 500
const backoffMax = 30000

async function flushOnce(): Promise<void> {
  if (flushing || buffer.length === 0) return
  flushing = true
  const batch = buffer.slice(0, 20)
  try {
    // send individually to keep server simple for now
    await Promise.all(batch.map((e) => fetch('/api/v1/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(e),
      keepalive: true,
    })))
    buffer = buffer.slice(batch.length)
    backoffMs = 500
  } catch {
    backoffMs = Math.min(backoffMax, backoffMs * 2)
  } finally {
    flushing = false
  }
}

export async function logEvent(ev: TelemetryEvent): Promise<void> {
  try { console.log(JSON.stringify({ event: 'telemetry_client', name: ev.name, data: ev.data })) } catch {}
  buffer.push({ name: ev.name, data: ev.data, ts: Date.now() })
  void flushOnce()
}

if (typeof window !== 'undefined') {
  try { window.addEventListener('online', () => { backoffMs = 500; void flushOnce() }) } catch {}
  try { setInterval(() => { void flushOnce() }, 5000) } catch {}
}


