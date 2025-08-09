'use client'
import { useEffect, useState } from 'react'

type Counters = {
  coins: number
  tickets: number
  coinMultiplier: number
  level: number
  totalTaps: number
} | null

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [counters, setCounters] = useState<Counters>(null)

  async function devLogin() {
    const token = process.env.NEXT_PUBLIC_DEV_TOKEN || ''
    const res = await fetch('/api/v1/auth/dev', { method: 'POST', headers: { 'x-dev-token': token } })
    if (res.ok) {
      const data = await res.json()
      setUserId(data.userId)
    } else {
      alert('Dev login failed')
    }
  }

  async function startSession() {
    const res = await fetch('/api/v1/session/start', { method: 'POST' })
    if (!res.ok) return
  }

  async function tap() {
    const res = await fetch('/api/v1/ingest/taps', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ taps: 1, coinsDelta: 1 }) })
    if (res.ok) {
      const data = await res.json()
      setCounters(data.counters as Counters)
    }
  }

  useEffect(() => {}, [])

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Local Tap App</h1>
      {!userId ? (
        <button onClick={devLogin}>Dev Login</button>
      ) : (
        <>
          <div>user: {userId}</div>
          <button onClick={startSession}>Start Session</button>
          <button onClick={tap} style={{ marginLeft: 8 }}>Tap +1</button>
          <pre style={{ marginTop: 16 }}>{JSON.stringify(counters, null, 2)}</pre>
        </>
      )}
    </main>
  )
}
