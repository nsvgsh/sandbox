'use client'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/ui/Button/Button'
import { HeaderHUD } from '@/ui/Header/HeaderHUD'
import { LevelUpModal } from '@/ui/Modal/Modal'
import { normalizeCounters, parsePublicConfig, fetchJsonWithRetry } from '../lib/apiClient'
import { isMonetagLoaded, loadMonetagSdk, showRewardedInterstitial, categorizeMonetagError } from '../lib/ads/monetag'
import { showNotice } from '../lib/notice'
import { BottomNavShadow } from '@/ui/BottomNav/BottomNavShadow'
import { EarnGrid } from '@/ui/earn/EarnGrid/EarnGrid'

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

// Lightweight presentational scaffolding components for the main screen (Home/Game)
// function HeaderCounters({ counters }: { counters: Counters }) {
//   const coins = Number(counters?.coins ?? 0)
//   const tickets = Number(counters?.tickets ?? 0)
//   const level = Number(counters?.level ?? 0)
//   const boxStyle: React.CSSProperties = {
//     flex: 1,
//     padding: 12,
//     borderRadius: 12,
//     border: '1px solid rgba(0,0,0,0.1)',
//     background: 'rgba(0,0,0,0.02)'
//   }
//   const rowStyle: React.CSSProperties = { display: 'flex', gap: 8 }
//   const labelStyle: React.CSSProperties = { fontSize: 12, opacity: 0.8 }
//   const valueStyle: React.CSSProperties = { fontWeight: 700, marginTop: 4 }
//   return (
//     <div style={rowStyle}>
//       <div style={boxStyle}>
//         <div style={labelStyle}>🪙 Coins</div>
//         <div style={valueStyle}>{coins.toLocaleString()}</div>
//       </div>
//       <div style={boxStyle}>
//         <div style={labelStyle}>🎟 Tickets</div>
//         <div style={valueStyle}>{tickets.toLocaleString()}</div>
//       </div>
//       <div style={boxStyle}>
//         <div style={labelStyle}>🆙 Level</div>
//         <div style={valueStyle}>{level.toLocaleString(undefined, { minimumIntegerDigits: 2 })}</div>
//       </div>
//     </div>
//   )
// }

function AvatarRow() {
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 2px' }
  const avatar: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.08)'
  }
  const name: React.CSSProperties = { fontWeight: 600 }
  return (
    <div style={row}>
      <div style={avatar}>👤</div>
      <div style={name}>Player</div>
    </div>
  )
}

function TapArea({ onTap, next }: { onTap: () => void; next: NextThreshold }) {
  const area: React.CSSProperties = {
    height: 180,
    borderRadius: 16,
    border: '2px dashed rgba(0,0,0,0.2)',
    background: 'rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    cursor: 'pointer'
  }
  const hint: React.CSSProperties = { marginTop: 8, textAlign: 'center', opacity: 0.8, fontSize: 12 }
  const wrapper: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8 }
  const nextText = next ? `Next: L${next.level} • ${next.coins} coins` : 'Next: loading…'
  return (
    <div style={wrapper}>
      <div onClick={onTap} style={area} aria-label="Tap area to earn coins">
        <div style={{ fontSize: 18, fontWeight: 700 }}>TAP AREA</div>
      </div>
      <div style={hint}>{nextText}</div>
    </div>
  )
}

// Inline BottomNav replaced by Shadow DOM component

// Legacy inline LevelUpModal removed in favor of '@/ui/Modal/Modal'

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
  const [tasksLoading, setTasksLoading] = useState<boolean>(false)
  const tasksLoadInFlightRef = useRef<boolean>(false)
  const [leaderboard, setLeaderboard] = useState<any | null>(null)
  const [adUnlocks, setAdUnlocks] = useState<Record<string, { impressionId: string; expiresAt: number }>>({})
  const [adTTLSeconds, setAdTTLSeconds] = useState<number>(10)
  const [monetagEnabled, setMonetagEnabled] = useState<boolean>(false)
  const [monetagZoneId, setMonetagZoneId] = useState<string | undefined>(undefined)
  const [monetagSdkUrl, setMonetagSdkUrl] = useState<string | undefined>(undefined)
  const [unlockPolicy, setUnlockPolicy] = useState<'any'|'valued'>('any')
  const [logFailedAdEvents, setLogFailedAdEvents] = useState<boolean>(true)
  const [batchMinIntervalMs, setBatchMinIntervalMs] = useState<number>(100)
  const [pendingBonusConfirm, setPendingBonusConfirm] = useState<boolean>(false)
  const [bonusImpressionId, setBonusImpressionId] = useState<string | null>(null)
  const [bonusExpiresAt, setBonusExpiresAt] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState<number>(Date.now())
  const [activeSection, setActiveSection] = useState<'home' | 'offers' | 'wallet'>('home')
  const [offersTab, setOffersTab] = useState<'available' | 'completed'>('available')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [walletTab, setWalletTab] = useState<'withdrawals' | 'activity' | 'airdrop'>('withdrawals')
  const [claimSuccess, setClaimSuccess] = useState<{ taskId: string; rewardPayload: Record<string, unknown> | null } | null>(null)

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
    const { ok, status, json } = await fetchJsonWithRetry<any>('/api/v1/ingest/taps', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ taps: 1, clientSeq: nextSeq, sessionId: session.sessionId, sessionEpoch: session.sessionEpoch }),
    }, {
      retry429DelayMs: batchMinIntervalMs,
      onOutdated: async () => { await resumeOrStartSession() },
    })
    if (ok) {
      const data = json
      const c = normalizeCounters(data.counters)
      setCounters(c)
      setClientSeq(nextSeq)
      setLeveledUp(data?.leveledUp?.level ?? null)
      if (data?.leveledUp?.level) {
        try { await refreshDebug() } catch {}
      }
      setNextThreshold(data?.nextThreshold ?? null)
    } else {
      try {
        const errText = typeof json?.error === 'string' ? json.error : 'Something went wrong. Please try again.'
        showNotice(errText)
      } catch {
        showNotice('Something went wrong. Please try again.')
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
    const impressionId = crypto.randomUUID()
    const ymid = userId ? `${userId}:${impressionId}` : impressionId
    try {
      if (!monetagEnabled || !monetagZoneId || !monetagSdkUrl) throw new Error('sdk_not_loaded')
      if (!isMonetagLoaded(monetagZoneId)) {
        await loadMonetagSdk({ sdkUrl: monetagSdkUrl, zoneId: monetagZoneId })
      }
      const result = await showRewardedInterstitial(monetagZoneId, { ymid, requestVar: 'level_bonus' })
      // unlock_policy is 'any' → proceed on any resolved close
      const res = await fetch('/api/v1/ad/log', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          provider: 'monetag', placement: 'level_bonus', status: 'closed', intent: 'level_bonus', impressionId,
          result,
        }),
      })
      if (!res.ok) return
      const data = await res.json().catch(() => ({} as any))
      const ttl = Number(data?.expiresInSec ?? adTTLSeconds)
      setBonusImpressionId(impressionId)
      const expiresAt = Date.now() + (Number.isFinite(ttl) ? ttl * 1000 : adTTLSeconds * 1000)
      setBonusExpiresAt(expiresAt)
      setPendingBonusConfirm(true)
    } catch (e) {
      const reason = categorizeMonetagError(e)
      try { showNotice('No ad available. Try again later.') } catch {}
      if (logFailedAdEvents) {
        try {
          await fetch('/api/v1/ad/log', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ provider: 'monetag', placement: 'level_bonus', status: 'failed', impressionId, intent: 'level_bonus', error: { reason } }),
          })
        } catch {}
      }
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
    const { ok, json } = await fetchJsonWithRetry<any>('/api/v1/level/bonus/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idempotency-key': bonusImpressionId },
      body: JSON.stringify({ level: leveledUp, bonusMultiplier: 2, impressionId: bonusImpressionId }),
    })
    if (ok) {
      const c = json?.counters as any
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
      const code = json?.code as string | undefined
      if (code === 'TTL_EXPIRED') {
        try { console.log(JSON.stringify({ event: 'TTLExpired', action: 'bonus_claim', level: leveledUp })) } catch {}
        // revert to two buttons
        setPendingBonusConfirm(false)
        setBonusImpressionId(null)
        setBonusExpiresAt(null)
        return
      } else if (code === 'ALREADY_CLAIMED') {
        // treat as success
        try { console.log(JSON.stringify({ event: 'AlreadyClaimed', action: 'bonus_claim', level: leveledUp })) } catch {}
        await loadCounters()
        setPendingBonusConfirm(false)
        setLeveledUp(null)
        setBonusImpressionId(null)
        setBonusExpiresAt(null)
        return
      }
    }
  }

  function setUnlockForTask(taskId: string, impressionId: string, ttlSec: number) {
    const expiresAt = Date.now() + ttlSec * 1000
    const key = `task:${taskId}`
    try { sessionStorage.setItem(`unlock:${key}`, JSON.stringify({ impressionId, expiresAt })) } catch {}
    setAdUnlocks((s) => ({ ...s, [key]: { impressionId, expiresAt } }))
  }
  function readUnlockForTask(taskId: string): { impressionId: string; expiresAt: number } | null {
    const key = `task:${taskId}`
    const inState = adUnlocks[key]
    if (inState) return inState
    try {
      const raw = sessionStorage.getItem(`unlock:${key}`)
      if (!raw) return null
      const parsed = JSON.parse(raw) as { impressionId?: string; expiresAt?: number }
      if (parsed && typeof parsed.expiresAt === 'number' && typeof parsed.impressionId === 'string') return { impressionId: parsed.impressionId, expiresAt: parsed.expiresAt }
    } catch {}
    return null
  }
  function clearUnlockForTask(taskId: string) {
    const key = `task:${taskId}`
    try { sessionStorage.removeItem(`unlock:${key}`) } catch {}
    setAdUnlocks((s) => {
      const n = { ...s }
      delete n[key]
      return n
    })
  }

  async function loadCounters() {
    const { ok, json } = await fetchJsonWithRetry<any>('/api/v1/counters', { method: 'GET' })
    if (!ok) return
    const data = json
    {
      const c = normalizeCounters(data.counters)
      setCounters(c)
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
    // Do not set TTL from debug; TTL is sourced from public config only now
  }

  async function loadTasks() {
    if (tasksLoadInFlightRef.current) return
    tasksLoadInFlightRef.current = true
    setTasksLoading(true)
    try {
      const res = await fetch('/api/v1/tasks')
      if (!res.ok) return
      const data = await res.json()
      setTasks(data.definitions || [])
      // hydrate unlocks relevant to current tasks
      try {
        const list = (data.definitions || []) as { taskId: string }[]
        const nextUnlocks: Record<string, { impressionId: string; expiresAt: number }> = {}
        for (const t of list) {
          const u = readUnlockForTask(t.taskId)
          if (u) nextUnlocks[`task:${t.taskId}`] = u
        }
        setAdUnlocks(nextUnlocks)
      } catch {}
    } finally {
      tasksLoadInFlightRef.current = false
      setTasksLoading(false)
    }
  }

  // Watch ad for a specific task (intent-coupled)
  async function watchAdForTask(taskId: string) {
    const impressionId = crypto.randomUUID()
    const ymid = userId ? `${userId}:${impressionId}` : impressionId
    try {
      if (!monetagEnabled || !monetagZoneId || !monetagSdkUrl) throw new Error('sdk_not_loaded')
      if (!isMonetagLoaded(monetagZoneId)) {
        await loadMonetagSdk({ sdkUrl: monetagSdkUrl, zoneId: monetagZoneId })
      }
      const result = await showRewardedInterstitial(monetagZoneId, { ymid, requestVar: 'task_claim' })
      const res = await fetch('/api/v1/ad/log', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ provider: 'monetag', placement: 'task_claim', status: 'closed', intent: `task:${taskId}`, impressionId, result }),
      })
      if (!res.ok) return
      const ttl = Number.isFinite(adTTLSeconds) ? adTTLSeconds : 180
      setUnlockForTask(taskId, impressionId, ttl)
    } catch (e) {
      const reason = categorizeMonetagError(e)
      try { showNotice('No ad available. Try again later.') } catch {}
      if (logFailedAdEvents) {
        try {
          await fetch('/api/v1/ad/log', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ provider: 'monetag', placement: 'task_claim', status: 'failed', impressionId, intent: `task:${taskId}`, error: { reason } }),
          })
        } catch {}
      }
    }
  }

  async function claimTask(taskId: string) {
    const unlock = readUnlockForTask(taskId)
    const headers: Record<string, string> = {}
    if (unlock?.impressionId) headers['x-idempotency-key'] = unlock.impressionId
    if (unlock?.impressionId) { try { console.log(JSON.stringify({ event: 'TaskClaimIdemKeyUsed', taskId: taskId.slice(0,8), idem: unlock.impressionId.slice(0,8) })) } catch {} }
    const { ok, json } = await fetchJsonWithRetry<any>(`/api/v1/tasks/${taskId}/claim`, { method: 'POST', headers }, {
      onOutdated: async () => { await resumeOrStartSession() },
    })
    if (ok) {
      const t = Array.isArray(tasks) ? (tasks.find((x) => x.taskId === taskId) || null) : null
      clearUnlockForTask(taskId)
      setClaimSuccess({ taskId, rewardPayload: t?.rewardPayload ?? null })
      await loadTasks()
      await loadCounters()
    } else {
      const code = (json && (json.code as string)) || ''
      if (code === 'AD_REQUIRED') {
        try { console.log(JSON.stringify({ event: 'task_claim_ad_required', taskId: taskId.slice(0,8) })) } catch {}
        showNotice('Watch an ad for this offer first.')
      }
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

  // When leveledUp fires, fetch public reward reveal for modal (fallback remains debug data in props)
  useEffect(() => {
    if (!leveledUp) return
    void (async () => {
      try {
        const res = await fetch('/api/v1/level/last')
        if (!res.ok) return
        const data = await res.json().catch(() => null)
        if (data && typeof data.level === 'number') {
          setDebugState((s) => ({ ...(s || { counters: null, lastLevel: null, leaderboard: null, config: [] as any[] }), lastLevel: { level: data.level, reward_payload: data.rewardPayload, bonus_multiplier: null } }))
        }
      } catch {}
    })()
  }, [leveledUp])

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

  // Read public config once and cache timers/limits
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/v1/config')
        if (!res.ok) return
        const obj = await res.json()
        const cfg = parsePublicConfig(obj)
        setAdTTLSeconds(cfg.adTTLSeconds)
        setBatchMinIntervalMs(cfg.batchMinIntervalMs)
        setMonetagEnabled(Boolean(cfg.monetagEnabled))
        setMonetagZoneId(cfg.monetagZoneId)
        setMonetagSdkUrl(cfg.monetagSdkUrl)
        setUnlockPolicy(cfg.unlockPolicy || 'any')
        setLogFailedAdEvents(Boolean(cfg.logFailedAdEvents))
      } catch {}
    })()
  }, [])

  // Wallet: hydrate address from sessionStorage
  useEffect(() => {
    try {
      const addr = sessionStorage.getItem('wallet:address')
      if (addr && typeof addr === 'string') setWalletAddress(addr)
    } catch {}
  }, [])

  // Offers: tick for countdowns and prune expired unlocks; record expired for UI
  useEffect(() => {
    const id = setInterval(() => {
      setNowTick(Date.now())
      setAdUnlocks((prev) => {
        const next: typeof prev = { ...prev }
        for (const [key, u] of Object.entries(prev)) {
          if (!u || typeof u.expiresAt !== 'number') continue
          if (Date.now() > u.expiresAt) {
            delete next[key]
            try { sessionStorage.removeItem(`unlock:${key}`) } catch {}
          }
        }
        return next
      })
    }, 500)
    return () => clearInterval(id)
  }, [adTTLSeconds])

  // Refresh tasks when entering EARN (offers) section
  useEffect(() => {
    if (activeSection !== 'offers') return
    void loadTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection])

  // Refresh tasks when level changes (gating depends on level)
  const lastLevelRef = useRef<number | null>(null)
  useEffect(() => {
    const currentLevel = typeof counters?.level === 'number' ? counters.level : null
    if (currentLevel === null) return
    if (lastLevelRef.current === null) {
      lastLevelRef.current = currentLevel
      return
    }
    if (currentLevel !== lastLevelRef.current) {
      lastLevelRef.current = currentLevel
      void loadTasks()
    }
  }, [counters?.level])

  if (!mounted) {
    return (
      <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
        <h1>Local Tap App</h1>
      </main>
    )
  }

  return (
    <main style={{
      padding: 16,
      paddingBottom: 'calc(var(--bottomnav-height, 132px) + env(safe-area-inset-bottom))',
      fontFamily: 'ui-sans-serif, system-ui',
      maxWidth: 520,
      margin: '0 auto',
      minHeight: 'calc(100dvh - (var(--bottomnav-height, 132px) + env(safe-area-inset-bottom)))'
    }}>
      {!userId ? (
        <button onClick={devLogin}>Dev Login</button>
      ) : !session ? (
        <button onClick={resumeOrStartSession}>Start / Resume Session</button>
      ) : (
        <>
          {activeSection === 'home' && (
            <>
              <div style={{ marginBottom: 8 }}>
                <HeaderHUD counters={counters ? {
                  coins: Number(counters.coins ?? 0),
                  tickets: Number(counters.tickets ?? 0),
                  level: Number(counters.level ?? 0),
                } : null} />
              </div>
              <AvatarRow />
              <div style={{ marginTop: 8 }}>
                <TapArea onTap={tap} next={nextThreshold} />
              </div>
            </>
          )}

          {activeSection === 'offers' && (
            <div style={{ marginTop: 8 }}>
              <EarnGrid
                loading={tasksLoading}
                available={Array.isArray(tasks) ? tasks.filter((t) => t.state === 'available') : []}
                completed={Array.isArray(tasks) ? tasks.filter((t) => t.state === 'claimed') : []}
                activeTab={offersTab}
                onTabChange={setOffersTab}
                onWatch={(taskId) => watchAdForTask(taskId)}
                onClaim={(taskId) => claimTask(taskId)}
                secondsLeft={(taskId) => {
                  const unlock = readUnlockForTask(taskId)
                  return unlock ? Math.max(0, Math.ceil((unlock.expiresAt - nowTick) / 1000)) : null
                }}
              />
            </div>
          )}

          {activeSection === 'wallet' && (
            <div style={{ marginTop: 8 }}>
              {/* Wallet Header */}
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Wallet (balances)</div>
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                  We store ONLY your public address. Keys and funds remain under your control.
                </div>
              </div>

              {/* Connect Wallet */}
              <div style={{ marginTop: 12 }}>
                {!walletAddress ? (
                  <button
                    onClick={() => {
                      const v = window.prompt('Enter your public wallet address (demo only):') || ''
                      const trimmed = v.trim()
                      if (!trimmed) return
                      try { sessionStorage.setItem('wallet:address', trimmed) } catch {}
                      setWalletAddress(trimmed)
                    }}
                    style={{ width: '100%', padding: '12px 14px', fontWeight: 700, borderRadius: 12, border: '1px solid rgba(0,0,0,0.15)' }}
                  >
                    CONNECT WALLET
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, opacity: 0.8 }}>Connected address</div>
                      <div style={{ fontWeight: 600 }}>{walletAddress.length > 14 ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-6)}` : walletAddress}</div>
                    </div>
                    <button
                      onClick={() => { try { sessionStorage.removeItem('wallet:address') } catch {}; setWalletAddress(null) }}
                      style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)' }}
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

              {/* Balances */}
            <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Assets</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                    <div>◇ TON</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div>0.000</div>
                      <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>DEPOSIT</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                    <div>₮ USDT</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div>0.000</div>
                      <button disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>WITHDRAW</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                    <div>🪙 Coins</div>
                    <div>{Number(counters?.coins ?? 0).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: 10 }}>
                    <div>🎟 Tickets</div>
                    <div>{Number(counters?.tickets ?? 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{ marginTop: 16 }}>
                <div role="tablist" aria-label="Wallet" style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  {(['withdrawals','activity','airdrop'] as const).map((tab) => (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={walletTab === tab}
                      onClick={() => setWalletTab(tab)}
                      style={{ fontWeight: walletTab === tab ? 700 : 500 }}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>

                {walletTab === 'withdrawals' && (
                  <div style={{ opacity: 0.8 }}>(no requests yet)</div>
                )}
                {walletTab === 'activity' && (
                  <div style={{ opacity: 0.8 }}>(no activity yet)</div>
                )}
                {walletTab === 'airdrop' && (
                  <div style={{ opacity: 0.8 }}>(coming soon)</div>
                )}
              </div>
            </div>
          )}
          {typeof leveledUp === 'number' && (
            pendingBonusConfirm ? (
              <LevelUpModal
                level={leveledUp}
                rewards={{
                  coins: Number(((debugState?.lastLevel?.reward_payload as any)?.coins) ?? 0) * 2,
                  tickets: Number(((debugState?.lastLevel?.reward_payload as any)?.tickets) ?? 0) * 2,
                }}
                onClaimBase={async () => { /* not used in confirm state */ }}
                onStartAd={claimLevelBonusX2}
              />
            ) : (
              <LevelUpModal
                level={leveledUp}
                rewards={{
                  coins: Number(((debugState?.lastLevel?.reward_payload as any)?.coins) ?? 0),
                  tickets: Number(((debugState?.lastLevel?.reward_payload as any)?.tickets) ?? 0),
                }}
                onClaimBase={async () => { setLeveledUp(null); await loadCounters() }}
                onStartAd={startLevelBonus}
              />
            )
          )}

          {claimSuccess && (
            <TaskClaimModal
              rewardPayload={claimSuccess.rewardPayload}
              onClose={() => setClaimSuccess(null)}
            />
          )}

          {/* Developer info (kept for now, below the main scaffold)
          <div style={{ marginTop: 16, opacity: 0.8, fontSize: 12 }}>
            <div>user: {userId}</div>
            <div style={{ marginTop: 4 }}>session: {session.sessionId.slice(0, 8)} / epoch: {session.sessionEpoch.slice(0, 8)}</div>
            <div style={{ marginTop: 4 }}>clientSeq: {clientSeq}</div>
          </div>

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
                  <button onClick={() => claimTask(t.taskId)}>Claim {t.taskId.slice(0, 4)}</button>
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
          </div> */}

          <BottomNavShadow active={activeSection} onSelect={setActiveSection} />
        </>
      )}
    </main>
  )
}

function TaskClaimModal(props: {
  rewardPayload: Record<string, unknown> | null
  onClose: () => void
}) {
  const { rewardPayload, onClose } = props
  const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }
  const card: React.CSSProperties = { width: 'min(92vw, 420px)', borderRadius: 16, background: 'var(--background)', color: 'var(--foreground)', padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }
  const row: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const title: React.CSSProperties = { fontWeight: 800, fontSize: 18 }

  function toNumber(x: unknown): number | null {
    const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : NaN
    return Number.isFinite(n) ? n : null
  }
  function formatRewardList(payload: Record<string, unknown> | null): string {
    if (!payload) return '{ unknown }'
    const coins = toNumber(payload.coins)
    const tickets = toNumber(payload.tickets)
    const coinMult = toNumber((payload as any).coin_multiplier)
    const parts: string[] = []
    if (coins !== null) parts.push(`coins: ${coins}`)
    if (tickets !== null) parts.push(`tickets: ${tickets}`)
    if (coinMult !== null) parts.push(`coin_multiplier: ${coinMult}`)
    return parts.length ? `{ ${parts.join(', ')} }` : '{ unknown }'
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Task claimed" style={overlay} onClick={onClose}>
      <div style={card} onClick={(e) => e.stopPropagation()}>
        <div style={row}>
          <div style={title}>congratulations!</div>
          <button aria-label="Close" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 13 }}>reward: task_reward: {formatRewardList(rewardPayload)}</div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)', fontWeight: 700 }}>Close</button>
        </div>
      </div>
    </div>
  )
}
