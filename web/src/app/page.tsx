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
  const [mounted, setMounted] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [clientSeq, setClientSeq] = useState<number>(0)
  const [counters, setCounters] = useState<Counters>(null)
  const [leveledUp, setLeveledUp] = useState<number | null>(null)
  const [nextThreshold, setNextThreshold] = useState<NextThreshold>(null)
  const [debugState, setDebugState] = useState<DebugState>(null)
  const [tasks, setTasks] = useState<any[] | null>(null)
  const [leaderboard, setLeaderboard] = useState<any | null>(null)
  const [adUnlocks, setAdUnlocks] = useState<Record<string, number>>({})
  const [adTTLSeconds, setAdTTLSeconds] = useState<number>(10)
  const [pendingBonusConfirm, setPendingBonusConfirm] = useState<boolean>(false)
  const [bonusImpressionId, setBonusImpressionId] = useState<string | null>(null)
  const [bonusExpiresAt, setBonusExpiresAt] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState<number>(Date.now())

  async function devLogin() {
    const token = process.env.NEXT_PUBLIC_DEV_TOKEN || process.env.DEV_TOKEN || ''
    const res = await fetch('/api/v1/auth/dev', { method: 'POST', headers: { 'x-dev-token': token } })
    if (res.ok) {
      const data = await res.json()
      setUserId(data.userId)
    } else {
      alert('Dev login failed')
    }
  }

  async function resumeOrStartSession() {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('session') : null
      if (stored) {
        const s = JSON.parse(stored) as Partial<Session>
        const claimRes = await fetch('/api/v1/session/claim', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId: s.sessionId, sessionEpoch: s.sessionEpoch }),
        })
        if (claimRes.ok) {
          const data = (await claimRes.json()) as Session
          setSession(data)
          if (typeof window !== 'undefined') window.localStorage.setItem('session', JSON.stringify(data))
          setClientSeq(Number(data.lastAppliedSeq || 0))
          await loadCounters()
          return
        }
      }
    } catch {}
    await startSession()
  }

  async function startSession() {
    const res = await fetch('/api/v1/session/start', { method: 'POST' })
    if (!res.ok) return
    const data = (await res.json()) as Session
    setSession(data)
    setClientSeq(0)
    if (typeof window !== 'undefined') window.localStorage.setItem('session', JSON.stringify(data))
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
      const c = data.counters as any
      setCounters({
        coins: Number(c.coins || 0),
        tickets: Number(c.tickets || 0),
        coinMultiplier: Number(c.coinMultiplier ?? c.coin_multiplier ?? 1),
        level: Number(c.level || 0),
        totalTaps: Number(c.totalTaps ?? c.total_taps ?? 0),
      })
      setClientSeq(nextSeq)
      setLeveledUp(data.leveledUp?.level ?? null)
      setNextThreshold(data.nextThreshold ?? null)
    } else {
      try {
        if (res.status === 429) {
          // simple backoff and one retry
          await new Promise((r) => setTimeout(r, 200))
          await tap()
          return
        }
        const data = await res.json().catch(() => ({} as any))
        const code = (data && (data.code as string)) || ''
        if (res.status === 409 && (code === 'SUPERSEDED' || code === 'SEQ_REWIND')) {
          await resumeOrStartSession()
          await loadCounters()
          return
        }
        const errText = typeof data?.error === 'string' ? data.error : await res.text()
        alert(`Tap failed: ${errText}`)
      } catch {
        const err = await res.text().catch(() => 'unknown')
        alert(`Tap failed: ${err}`)
      }
    }
  }

  async function claimBonus(multiplier = 2) {
    // UI-only confirm step: bonus was already applied by ad/log with intent='level_bonus' in local flow
    setPendingBonusConfirm(false)
    setLeveledUp(null)
    await loadCounters()
  }

  // Start level bonus flow: watch ad, then enable Claim x2 for a short window
  async function startLevelBonus() {
    const res = await fetch('/api/v1/ad/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'stub', placement: 'level_bonus', status: 'completed', intent: 'level_bonus', impressionId: crypto.randomUUID() }),
    })
    if (!res.ok) return
    const data = await res.json().catch(() => ({} as any))
    const imp = typeof data?.impressionId === 'string' ? data.impressionId : null
    const ttl = Number(data?.expiresInSec ?? adTTLSeconds)
    if (imp) {
      setBonusImpressionId(imp)
      const expiresAt = Date.now() + (Number.isFinite(ttl) ? ttl * 1000 : adTTLSeconds * 1000)
      setBonusExpiresAt(expiresAt)
      setPendingBonusConfirm(true)
    }
  }

  // Claim x2 within the ad TTL window
  async function claimLevelBonusX2() {
    if (!leveledUp || !bonusImpressionId) return
    // auto-expire guard
    if (bonusExpiresAt && Date.now() > bonusExpiresAt) {
      setPendingBonusConfirm(false)
      setBonusImpressionId(null)
      setBonusExpiresAt(null)
      return
    }
    const res = await fetch('/api/v1/level/bonus/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idempotency-key': bonusImpressionId },
      body: JSON.stringify({ level: leveledUp, bonusMultiplier: 2, impressionId: bonusImpressionId }),
    })
    if (res.ok) {
      const data = await res.json().catch(() => ({} as any))
      const c = data?.counters as any
      if (c) {
        setCounters({
          coins: Number(c.coins || 0),
          tickets: Number(c.tickets || 0),
          coinMultiplier: Number(c.coinMultiplier ?? c.coin_multiplier ?? 1),
          level: Number(c.level || 0),
          totalTaps: Number(c.totalTaps ?? c.total_taps ?? 0),
        })
      }
      setPendingBonusConfirm(false)
      setLeveledUp(null)
      setBonusImpressionId(null)
      setBonusExpiresAt(null)
    } else {
      const data = await res.json().catch(() => ({} as any))
      if (data?.code === 'TTL_EXPIRED') {
        // revert to two buttons
        setPendingBonusConfirm(false)
        setBonusImpressionId(null)
        setBonusExpiresAt(null)
        return
      }
    }
  }

  function setUnlock(key: string) {
    setAdUnlocks((s) => ({ ...s, [key]: Date.now() }))
  }
  function isUnlocked(key: string) {
    const ts = adUnlocks[key]
    return typeof ts === 'number' && Date.now() - ts < adTTLSeconds * 1000
  }

  async function loadCounters() {
    const res = await fetch('/api/v1/counters')
    if (!res.ok) return
    const data = await res.json()
    {
      const c = data.counters as any
      setCounters({
        coins: Number(c.coins || 0),
        tickets: Number(c.tickets || 0),
        coinMultiplier: Number(c.coinMultiplier ?? c.coin_multiplier ?? 1),
        level: Number(c.level || 0),
        totalTaps: Number(c.totalTaps ?? c.total_taps ?? 0),
      })
    }
    setNextThreshold(data.nextThreshold as NextThreshold)
  }

  async function refreshDebug() {
    if (!userId) return
    const token = process.env.NEXT_PUBLIC_DEV_TOKEN || process.env.DEV_TOKEN || ''
    const res = await fetch('/api/v1/admin/debug/state', {
      method: 'GET',
      headers: { 'x-dev-token': token, 'x-user-id': userId },
    })
    if (!res.ok) return
    const data = (await res.json()) as DebugState
    setDebugState(data)
    try {
      const cfg = Object.fromEntries((data.config || []).map((r: any) => [r.key, r.value])) as Record<string, any>
      const ttl = Number(cfg['ad_ttl_seconds'] ?? 180)
      if (!Number.isNaN(ttl)) setAdTTLSeconds(ttl)
    } catch {}
  }

  async function loadTasks() {
    const res = await fetch('/api/v1/tasks')
    if (!res.ok) return
    const data = await res.json()
    setTasks(data.definitions || [])
  }

  // Watch ad for a specific task (intent-coupled)
  async function watchAdForTask(taskId: string) {
    await fetch('/api/v1/ad/log', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'stub', placement: 'task_claim', status: 'completed', intent: `task:${taskId}`, impressionId: crypto.randomUUID() }),
    }).catch(() => {})
    setUnlock(`task:${taskId}`)
  }

  async function claimTask(taskId: string) {
    const res = await fetch(`/api/v1/tasks/${taskId}/claim`, { method: 'POST' })
    if (res.ok) {
      setAdUnlocks((s) => {
        const n = { ...s }
        delete n[`task:${taskId}`]
        return n
      })
      await loadTasks()
      await loadCounters()
    } else {
      const data = await res.json().catch(() => ({} as any))
      if (data?.code === 'AD_REQUIRED') alert('Watch an ad for this task first')
    }
  }

  async function loadLeaderboard() {
    const res = await fetch('/api/v1/leaderboard?top=10')
    if (!res.ok) return
    const data = await res.json()
    setLeaderboard(data)
  }

  useEffect(() => {
    if (userId && !session) {
      void (async () => {
        await refreshDebug()
        await resumeOrStartSession()
        await loadTasks()
        await loadLeaderboard()
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Tick for countdown while waiting for Claim x2
  useEffect(() => {
    if (!pendingBonusConfirm || !bonusExpiresAt) return
    const id = setInterval(() => setNowTick(Date.now()), 500)
    return () => clearInterval(id)
  }, [pendingBonusConfirm, bonusExpiresAt])

  // Auto-revert to two-button state when countdown expires
  useEffect(() => {
    if (!pendingBonusConfirm || !bonusExpiresAt) return
    if (Date.now() > bonusExpiresAt) {
      setPendingBonusConfirm(false)
      setBonusImpressionId(null)
      setBonusExpiresAt(null)
    }
  }, [pendingBonusConfirm, bonusExpiresAt, nowTick])

  async function refreshAll() {
    await Promise.all([loadCounters(), loadTasks(), loadLeaderboard(), refreshDebug()])
  }

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
        <h1>Local Tap App</h1>
      </main>
    )
  }

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Local Tap App</h1>
      {!userId ? (
        <button onClick={devLogin}>Dev Login</button>
      ) : !session ? (
        <button onClick={resumeOrStartSession}>Start / Resume Session</button>
      ) : (
        <>
          <div>user: {userId}</div>
          <div style={{ marginTop: 8 }}>session: {session.sessionId.slice(0, 8)} / epoch: {session.sessionEpoch.slice(0, 8)}</div>
          <div style={{ marginTop: 8 }}>clientSeq: {clientSeq}</div>
          <button onClick={tap} style={{ marginTop: 8 }}>Tap +1</button>
          {leveledUp && (
            <div style={{ marginTop: 12 }}>
              <div>Level up! Reached level {leveledUp}</div>
              {!pendingBonusConfirm ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button onClick={() => { setLeveledUp(null) }}>Claim</button>
                  <button onClick={startLevelBonus}>X2 bonus</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <button onClick={claimLevelBonusX2} disabled={Boolean(bonusExpiresAt && Date.now() > bonusExpiresAt)}>Claim x2{bonusExpiresAt ? ` (${Math.max(0, Math.ceil((bonusExpiresAt - nowTick) / 1000))}s)` : ''}</button>
                </div>
              )}
            </div>
          )}
          <pre style={{ marginTop: 16 }}>{JSON.stringify(counters, null, 2)}</pre>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontWeight: 600 }}>Tasks</div>
              <button onClick={loadTasks}>Refresh</button>
            </div>
            <pre style={{ marginTop: 6 }}>{JSON.stringify(tasks, null, 2)}</pre>
            {Array.isArray(tasks) && tasks
              .filter((t) => t.state === 'available')
              .map((t) => (
                <div key={t.taskId} style={{ display: 'inline-flex', gap: 8, alignItems: 'center', marginRight: 12 }}>
                  <button onClick={() => watchAdForTask(t.taskId)}>Watch ad</button>
                  <button onClick={() => claimTask(t.taskId)} disabled={!isUnlocked(`task:${t.taskId}`)}>Claim {t.taskId.slice(0, 4)}</button>
                </div>
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
