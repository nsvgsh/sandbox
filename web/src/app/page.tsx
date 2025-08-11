'use client'
import { useEffect, useState } from 'react'

type Counters = {
  coins: number
  tickets: number
  coinMultiplier: number
  level: number
  totalTaps: number
} | null

type Session = { sessionId: string; sessionEpoch: string; lastAppliedSeq: number }
type NextThreshold = { level: number; coins: number } | null
type DebugState = {
  counters: any | null
  lastLevel: { level: number; reward_payload: Record<string, unknown> | null; bonus_multiplier: number | null } | null
  leaderboard: any | null
  config: { key: string; value: unknown }[]
  nextTemplates?: { level: number; templateId: string | null; payload: unknown }[]
} | null

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [clientSeq, setClientSeq] = useState<number>(0)
  const [counters, setCounters] = useState<Counters>(null)
  const [leveledUp, setLeveledUp] = useState<number | null>(null)
  const [nextThreshold, setNextThreshold] = useState<NextThreshold>(null)
  const [debugState, setDebugState] = useState<DebugState>(null)
  const [tasks, setTasks] = useState<any[] | null>(null)
  const [leaderboard, setLeaderboard] = useState<any | null>(null)

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
    const data = (await res.json()) as Session
    setSession(data)
    setClientSeq(0)
    await loadCounters()
  }

  async function tap() {
    if (!session) return
    const nextSeq = clientSeq + 1
    const res = await fetch('/api/v1/ingest/taps', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        taps: 1,
        clientSeq: nextSeq,
        sessionId: session.sessionId,
        sessionEpoch: session.sessionEpoch,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      setCounters(data.counters as Counters)
      setClientSeq(nextSeq)
      setLeveledUp(data.leveledUp?.level ?? null)
      setNextThreshold(data.nextThreshold ?? null)
    } else {
      const err = await res.text()
      alert(`Tap failed: ${err}`)
    }
  }

  async function claimBonus(multiplier = 2) {
    if (!leveledUp) return
    const idem = crypto.randomUUID()
    const res = await fetch('/api/v1/level/bonus/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idempotency-key': idem },
      body: JSON.stringify({ level: leveledUp, bonusMultiplier: multiplier }),
    })
    if (res.ok) {
      const data = await res.json()
      setCounters(data.counters as Counters)
      setLeveledUp(null)
      setNextThreshold(data.nextThreshold ?? null)
    } else {
      const err = await res.text()
      alert(`Claim failed: ${err}`)
    }
  }

  async function loadCounters() {
    const res = await fetch('/api/v1/counters')
    if (!res.ok) return
    const data = await res.json()
    setCounters(data.counters as Counters)
    setNextThreshold(data.nextThreshold as NextThreshold)
  }

  async function refreshDebug() {
    if (!userId) return
    const token = process.env.NEXT_PUBLIC_DEV_TOKEN || ''
    const res = await fetch('/api/v1/admin/debug/state', {
      method: 'GET',
      headers: { 'x-dev-token': token, 'x-user-id': userId },
    })
    if (!res.ok) return
    const data = (await res.json()) as DebugState
    setDebugState(data)
  }

  async function loadTasks() {
    const res = await fetch('/api/v1/tasks')
    if (!res.ok) return
    const data = await res.json()
    setTasks(data.definitions || [])
  }

  async function claimTask(taskId: string) {
    // Minimal stub flow: log ad_completed before claiming to satisfy AD_REQUIRED
    await fetch('/api/v1/ad/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'stub', placement: 'task', status: 'completed', impressionId: crypto.randomUUID() }),
    }).catch(() => {})
    const res = await fetch(`/api/v1/tasks/${taskId}/claim`, { method: 'POST' })
    if (res.ok) {
      await loadTasks()
      await loadCounters()
    }
  }

  async function loadLeaderboard() {
    const res = await fetch('/api/v1/leaderboard?top=10')
    if (!res.ok) return
    const data = await res.json()
    setLeaderboard(data)
  }

  useEffect(() => {}, [])
  async function refreshAll() {
    await Promise.all([loadCounters(), loadTasks(), loadLeaderboard(), refreshDebug()])
  }

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Local Tap App</h1>
      {!userId ? (
        <button onClick={devLogin}>Dev Login</button>
      ) : !session ? (
        <button onClick={startSession}>Start Session</button>
      ) : (
        <>
          <div>user: {userId}</div>
          <div style={{ marginTop: 8 }}>session: {session.sessionId.slice(0, 8)} / epoch: {session.sessionEpoch.slice(0, 8)}</div>
          <div style={{ marginTop: 8 }}>clientSeq: {clientSeq}</div>
          <button onClick={tap} style={{ marginTop: 8 }}>Tap +1</button>
          {leveledUp && (
            <div style={{ marginTop: 12 }}>
              <div>Level up! Reached level {leveledUp}</div>
              <button onClick={() => claimBonus(2)} style={{ marginTop: 6 }}>Claim x2 bonus</button>
            </div>
          )}
          <pre style={{ marginTop: 16 }}>{JSON.stringify(counters, null, 2)}</pre>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Tasks</div>
              <button onClick={loadTasks}>Refresh</button>
            </div>
            <pre style={{ marginTop: 6 }}>{JSON.stringify(tasks, null, 2)}</pre>
            {Array.isArray(tasks) && tasks.filter((t) => t.state === 'available').map((t) => (
              <button key={t.taskId} onClick={() => claimTask(t.taskId)} style={{ marginRight: 8 }}>Claim {t.taskId.slice(0, 4)}</button>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Leaderboard</div>
              <button onClick={loadLeaderboard}>Refresh</button>
            </div>
            <pre style={{ marginTop: 6 }}>{JSON.stringify(leaderboard, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Templates (next 3 levels)</div>
              <button onClick={refreshDebug}>Refresh</button>
            </div>
            <pre style={{ marginTop: 6 }}>{JSON.stringify(debugState?.nextTemplates ?? null, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Config snapshot</div>
              <button onClick={refreshDebug}>Refresh</button>
              <button onClick={refreshAll}>Refresh All</button>
            </div>
            <pre style={{ marginTop: 6 }}>{JSON.stringify(debugState?.config ?? null, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600 }}>Level-up conditions</div>
            <pre style={{ marginTop: 6 }}>{JSON.stringify(nextThreshold, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Level-up bonus (last event)</div>
              <button onClick={refreshDebug}>Refresh details</button>
            </div>
            <pre style={{ marginTop: 6 }}>{JSON.stringify(debugState?.lastLevel?.reward_payload ?? null, null, 2)}</pre>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600 }}>Bonus multiplier (last event)</div>
            <div style={{ marginTop: 6 }}>{debugState?.lastLevel?.bonus_multiplier ?? 'n/a'}</div>
          </div>
        </>
      )}
    </main>
  )
}
