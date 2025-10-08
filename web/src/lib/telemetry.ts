export type TelemetryEvent = {
  name: string
  data?: Record<string, unknown>
}

export async function logEvent(ev: TelemetryEvent): Promise<void> {
  try {
    await fetch('/api/v1/telemetry', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: ev.name, data: ev.data, ts: Date.now() }),
      keepalive: true,
    })
  } catch {}
}


