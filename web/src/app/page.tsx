'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { HeaderHUD } from '@/ui/Header/HeaderHUD'
import { LevelUpModal } from '@/ui/Modal/Modal'
import { FreeTrialLevelUpModal } from '@/ui/Modal/FreeTrialModal'
import { normalizeCounters, parsePublicConfig, fetchJsonWithRetry, type CountersNormalized } from '../lib/apiClient'
import { isMonetagLoaded, loadMonetagSdk, showRewardedInterstitial, categorizeMonetagError } from '../lib/ads/monetag'
import { showNotice } from '../lib/notice'
import { BottomNavShadow } from '@/ui/BottomNav/BottomNavShadow'
import { EarnGrid } from '@/ui/earn/EarnGrid/EarnGrid'
import { Wallet } from '@/ui/wallet/Wallet/Wallet'
import { ScreenContainer } from '@/ui/ScreenContainer/ScreenContainer'
import pageStyles from './page.module.css'
import { EmojiClicker } from '@/ui/Clicker'
import { RotatingTextRing } from '@/ui/Clicker/RotatingTextRing'

type TapWindow = Window & { __tapConfigCoinsPerTap?: number }

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
  counters: CountersNormalized | null
  lastLevel: { level: number; reward_payload: Record<string, unknown> | null; bonus_multiplier: number | null } | null
  leaderboard: unknown | null
  config: { key: string; value: unknown }[]
  nextTemplates?: { level: number; templateId: string | null; payload: unknown }[]
} | null

 

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
  return (
    <div style={row}>
      <div style={avatar}>👤</div>
      <div className={pageStyles.playerLabel}>Player</div>
    </div>
  )
}

 

// Inline BottomNav replaced by Shadow DOM component

// Legacy inline LevelUpModal removed in favor of '@/ui/Modal/Modal'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [insideTelegram, setInsideTelegram] = useState<boolean>(false)
  const [showDevChoice, setShowDevChoice] = useState<boolean>(false)
  const [tgUserIdFromProbe, setTgUserIdFromProbe] = useState<number | null>(null)
  const [clickerSize, setClickerSize] = useState<number>(156)
  const [userId, setUserId] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [clientSeq, setClientSeq] = useState<number>(0)
  const [counters, setCounters] = useState<Counters>(null)
  // Aggregator state
  const baseCountersRef = useRef<CountersNormalized | null>(null)
  const [displayCoins, setDisplayCoins] = useState<number>(0)
  const [pendingTaps, setPendingTaps] = useState<number>(0)
  const inflightRef = useRef<boolean>(false)
  const lastFlushAtRef = useRef<number>(0)
  const flushThresholdRef = useRef<number>(20)
  const ingestMaxBatchRef = useRef<number | undefined>(undefined)
  const effectiveFlushRef = useRef<number>(20)
  const tweenMinRef = useRef<number>(80)
  const tweenMaxRef = useRef<number>(180)
  const [leveledUp, setLeveledUp] = useState<number | null>(null)
  const [nextThreshold, setNextThreshold] = useState<NextThreshold>(null)
  const [debugState, setDebugState] = useState<DebugState>(null)
  const [bootScaffold, setBootScaffold] = useState<boolean>(true)
  type TaskDef = { taskId: string; state: 'available' | 'claimed'; rewardPayload?: Record<string, unknown>; kind?: string | null; unlockLevel?: number | null }
  const [tasks, setTasks] = useState<TaskDef[] | null>(null)
  const [tasksLoading, setTasksLoading] = useState<boolean>(false)
  const tasksLoadInFlightRef = useRef<boolean>(false)
  // remove unused leaderboard state to satisfy no-unused-vars
  // const [leaderboard, setLeaderboard] = useState<unknown | null>(null)
  const [adUnlocks, setAdUnlocks] = useState<Record<string, { impressionId: string; expiresAt: number }>>({})
  const [adTTLSeconds, setAdTTLSeconds] = useState<number>(10)
  const [hudTweenMs, setHudTweenMs] = useState<number>(0)
  const [monetagEnabled, setMonetagEnabled] = useState<boolean>(false)
  const [monetagZoneId, setMonetagZoneId] = useState<string | undefined>(undefined)
  const [monetagSdkUrl, setMonetagSdkUrl] = useState<string | undefined>(undefined)
  // const [unlockPolicy, setUnlockPolicy] = useState<'any'|'valued'>('any')
  const [logFailedAdEvents, setLogFailedAdEvents] = useState<boolean>(true)
  const [batchMinIntervalMs, setBatchMinIntervalMs] = useState<number>(100)
  const [pendingBonusConfirm, setPendingBonusConfirm] = useState<boolean>(false)
  const decisionForLevelRef = useRef<number | null>(null)
  const [levelModalDecision, setLevelModalDecision] = useState<'unknown'|'free_trial'|'regular'>('unknown')
  const [bonusImpressionId, setBonusImpressionId] = useState<string | null>(null)
  const [bonusExpiresAt, setBonusExpiresAt] = useState<number | null>(null)
  const [nowTick, setNowTick] = useState<number>(Date.now())
  const [activeSection, setActiveSection] = useState<'home' | 'offers' | 'wallet'>('home')
  const [offersTab, setOffersTab] = useState<'available' | 'completed'>('available')
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  // const [walletTab, setWalletTab] = useState<'withdrawals' | 'activity' | 'airdrop'>('withdrawals')
  const [claimSuccess, setClaimSuccess] = useState<{ taskId: string; rewardPayload: Record<string, unknown> | null } | null>(null)
  const [freeTrialAtLevel, setFreeTrialAtLevel] = useState<{ taskId: string; level: number } | null>(null)

  // CTA ring visibility based on tap activity
  const [ctaVisible, setCtaVisible] = useState<boolean>(true)
  const idleTimerRef = useRef<number | null>(null)
  const touchActivity = useCallback(() => {
    setCtaVisible(false)
    if (idleTimerRef.current) {
      try { window.clearTimeout(idleTimerRef.current) } catch {}
    }
    idleTimerRef.current = window.setTimeout(() => setCtaVisible(true), 1000)
  }, [])

  async function devLogin() {
    try { console.log(JSON.stringify({ event: 'client_scaffold_on', reason: 'auth_dev' })) } catch {}
    try { setBootScaffold(true) } catch {}
    const token = process.env.NEXT_PUBLIC_DEV_TOKEN || process.env.DEV_TOKEN || ''
    const headers: Record<string, string> = { 'x-dev-token': token }
    if (tgUserIdFromProbe && Number.isFinite(tgUserIdFromProbe)) headers['x-telegram-user-id'] = String(tgUserIdFromProbe)
    const res = await fetch('/api/v1/auth/dev', { method: 'POST', headers })
    if (res.ok) {
      const data = await res.json()
      setUserId(data.userId)
    } else {
      alert('Dev login failed')
      try { console.log(JSON.stringify({ event: 'client_scaffold_off', reason: 'error_auth_dev' })) } catch {}
      try { setBootScaffold(false) } catch {}
    }
  }

  async function resumeOrStartSession() {
    try {
      const stored = typeof window !== 'undefined' ? window.localStorage.getItem('session') : null
      if (stored) {
        const s = JSON.parse(stored) as Partial<Session>
        const startapp = typeof window !== 'undefined' ? getStartAppFromContext() : undefined
        const claimHeaders: Record<string, string> = { 'content-type': 'application/json' }
        if (startapp) claimHeaders['x-startapp'] = startapp
        const claimRes = await fetch('/api/v1/session/claim', {
          method: 'POST',
          headers: claimHeaders,
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

  type TgWebApp = { tgWebAppStartParam?: string; initDataUnsafe?: { start_param?: string } }
  type WindowWithTelegram = Window & { Telegram?: { WebApp?: TgWebApp } }

  function getStartAppFromContext(): string | undefined {
    try {
      // Prefer Telegram WebApp param if available
      const w = window as WindowWithTelegram
      const tg = w.Telegram?.WebApp
      const tgStartA = typeof tg?.tgWebAppStartParam === 'string' ? tg.tgWebAppStartParam : undefined
      if (tgStartA) return tgStartA
      const tgStartB = typeof tg?.initDataUnsafe?.start_param === 'string' ? tg.initDataUnsafe.start_param : undefined
      if (tgStartB) return tgStartB
    } catch {}
    try {
      const url = new URL(window.location.href)
      const s1 = url.searchParams.get('startapp')
      if (s1) return s1
      const s2 = url.searchParams.get('tgWebAppStartParam')
      if (s2) return s2
    } catch {}
    return undefined
  }

  // AuthGate: decide on initial auth inside Telegram
  useEffect(() => {
    if (!mounted || userId) return
    try {
      const w = window as WindowWithTelegram & { Telegram?: { WebApp?: TgWebApp & { initData?: string } } }
      const tg = w.Telegram?.WebApp
      const initDataRaw = (tg as unknown as { initData?: string })?.initData || ''
      const hasValidInitData = typeof initDataRaw === 'string' && initDataRaw.length >= 10
      setInsideTelegram(hasValidInitData)
      try { console.log(JSON.stringify({ event: 'client_boot', branch: hasValidInitData ? 'inside_tg' : 'outside_tg' })) } catch {}
      if (!hasValidInitData) {
        try { console.log(JSON.stringify({ event: 'client_scaffold_off', reason: 'outside_gate' })) } catch {}
        setBootScaffold(false)
        return
      }
      let cancelled = false
      ;(async () => {
        try {
          // Probe allowlist
          const corr = crypto.randomUUID()
          const probe = await fetch('/api/v1/auth/dev/allowlist', { method: 'POST', headers: { 'content-type': 'application/json', 'x-client-corr': corr }, body: JSON.stringify({ initDataRaw }) })
          if (cancelled) return
          if (probe.ok) {
            const pj = await probe.json().catch(() => ({} as { devEligible?: boolean; tgUserId?: number }))
            if (pj && pj.devEligible) {
              try { console.log(JSON.stringify({ event: 'client_scaffold_off', reason: 'dev_choice' })) } catch {}
              setBootScaffold(false)
              try { console.log(JSON.stringify({ event: 'client_probe_dev_yes', corr, tgUserId: pj.tgUserId })) } catch {}
              setTgUserIdFromProbe(typeof pj.tgUserId === 'number' ? pj.tgUserId : null)
              setShowDevChoice(true)
              return
            }
          }
          try { console.log(JSON.stringify({ event: 'client_probe_dev_no', corr })) } catch {}
          // Non-dev: auto auth via Telegram
          try { console.log(JSON.stringify({ event: 'client_scaffold_on', reason: 'auth_tg' })) } catch {}
          setBootScaffold(true)
          const auth = await fetch('/api/v1/auth/tg', { method: 'POST', headers: { 'content-type': 'application/json', 'authorization': `tma ${initDataRaw}`, 'x-client-corr': corr }, body: JSON.stringify({ initDataRaw }) })
          if (cancelled) return
          if (auth.ok) {
            const aj = await auth.json().catch(() => ({} as { user?: { userId?: string } }))
            const uid = String(aj?.user?.userId || '')
            if (uid) setUserId(uid)
            try { console.log(JSON.stringify({ event: 'client_auth_tg_ok', corr, userId: uid })) } catch {}
          } else {
            try {
              const reason = auth.headers.get('x-debug-reason') || 'unknown'
              const msg = reason === 'invalid' ? 'Login error: invalid or expired session. Please relaunch from Telegram.' : 'Login error. Please try again.'
              showNotice(msg)
              console.log(JSON.stringify({ event: 'client_auth_tg_fail', corr, status: auth.status, reason }))
              try { console.log(JSON.stringify({ event: 'client_scaffold_off', reason: 'error_auth_tg' })) } catch {}
              setBootScaffold(false)
            } catch { showNotice('Login error. Please try again.') }
          }
        } catch {}
      })()
      return () => { cancelled = true }
    } catch {}
  }, [mounted, userId])

  function devAffordanceOutsideEnabled(): boolean {
    try {
      if (process.env.NEXT_PUBLIC_ENABLE_OUTSIDE_TG_DEV !== '1') return false
      const url = new URL(window.location.href)
      return url.searchParams.get('dev') === '1'
    } catch { return false }
  }

  async function startSession() {
    const startapp = typeof window !== 'undefined' ? getStartAppFromContext() : undefined
    const headers: Record<string, string> = {}
    if (startapp) headers['x-startapp'] = startapp
    const res = await fetch('/api/v1/session/start', { method: 'POST', headers })
    if (!res.ok) return
    const data = (await res.json()) as Session
    setSession(data)
    setClientSeq(0)
    if (typeof window !== 'undefined') window.localStorage.setItem('session', JSON.stringify(data))
    await loadCounters()
  }

  function deriveDisplayCoins(base: CountersNormalized | null, pending: number): number {
    const coins = Number(base?.coins ?? 0)
    const mult = Number(base?.coinMultiplier ?? 1)
    const cpt = Number(((window as unknown as TapWindow)?.__tapConfigCoinsPerTap) ?? 1)
    const delta = Math.floor(Math.max(0, pending) * Math.max(1, mult) * Math.max(1, cpt))
    return coins + delta
  }

  async function tap() {
    if (!session) return
    touchActivity()
    setPendingTaps((p) => {
      const next = p + 1
      const base = baseCountersRef.current
      const target = deriveDisplayCoins(base, next)
      setDisplayCoins((prev) => (target < prev ? prev : target))
      try {
        const threshold = Math.max(1, effectiveFlushRef.current || flushThresholdRef.current || 1)
        const now = Date.now()
        const since = now - lastFlushAtRef.current
        const canByTime = since >= Math.max(50, batchMinIntervalMs)
        if (!inflightRef.current && next >= threshold && canByTime) {
          setTimeout(() => { void flushOnceRef.current?.() }, 0)
        }
      } catch {}
      return next
    })
  }

  // removed unused claimBonus

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
      const data = await res.json().catch(() => ({} as unknown))
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
    const { ok, json } = await fetchJsonWithRetry<unknown>('/api/v1/level/bonus/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-idempotency-key': bonusImpressionId },
      body: JSON.stringify({ level: leveledUp, bonusMultiplier: 2, impressionId: bonusImpressionId }),
    })
    if (ok) {
      const normalized = normalizeCounters((json as { counters?: unknown })?.counters)
      setCounters(normalized)
      setPendingBonusConfirm(false)
      setLeveledUp(null)
      setBonusImpressionId(null)
      setBonusExpiresAt(null)
    } else {
      const code = (json as { code?: string })?.code
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
  const readUnlockForTask = useCallback((taskId: string): { impressionId: string; expiresAt: number } | null => {
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
  }, [adUnlocks])
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
    const { ok, json } = await fetchJsonWithRetry<unknown>('/api/v1/counters', { method: 'GET' })
    if (!ok) return
    const data = json as { counters: unknown; nextThreshold?: NextThreshold }
    {
      const c = normalizeCounters(data.counters)
      setCounters(c)
      baseCountersRef.current = c
      // Reset display to at least server value
      setDisplayCoins((prev) => (prev < c.coins ? c.coins : prev))
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

  const loadTasks = useCallback(async () => {
    if (tasksLoadInFlightRef.current) return
    tasksLoadInFlightRef.current = true
    setTasksLoading(true)
    try {
      const res = await fetch('/api/v1/tasks')
      if (!res.ok) return
      const data = await res.json() as { definitions?: TaskDef[] }
      setTasks(data.definitions || [])
      // hydrate unlocks relevant to current tasks
      try {
        const list = (data.definitions || []) as { taskId: string }[]
        const computed: Record<string, { impressionId: string; expiresAt: number }> = {}
        for (const t of list) {
          const u = readUnlockForTask(t.taskId)
          if (u) computed[`task:${t.taskId}`] = u
        }
        setAdUnlocks((prev) => {
          const prevKeys = Object.keys(prev)
          const nextKeys = Object.keys(computed)
          if (prevKeys.length === nextKeys.length) {
            let same = true
            for (const k of nextKeys) {
              const a = prev[k]
              const b = computed[k]
              if (!a || !b || a.impressionId !== b.impressionId || a.expiresAt !== b.expiresAt) { same = false; break }
            }
            if (same) return prev
          }
          return computed
        })
      } catch {}
    } finally {
      tasksLoadInFlightRef.current = false
      setTasksLoading(false)
    }
  }, [readUnlockForTask])

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
    const { ok, json } = await fetchJsonWithRetry<unknown>(`/api/v1/tasks/${taskId}/claim`, { method: 'POST', headers }, {
      onOutdated: async () => { await resumeOrStartSession() },
    })
    if (ok) {
      const t = Array.isArray(tasks) ? (tasks.find((x) => x.taskId === taskId) || null) : null
      clearUnlockForTask(taskId)
      setClaimSuccess({ taskId, rewardPayload: t?.rewardPayload ?? null })
      await loadTasks()
      await loadCounters()
    } else {
      const code = (json && (json as { code?: string }).code) || ''
      if (code === 'AD_REQUIRED') {
        try { console.log(JSON.stringify({ event: 'task_claim_ad_required', taskId: taskId.slice(0,8) })) } catch {}
        clearUnlockForTask(taskId)
        showNotice('Watch an ad for this offer first.')
      }
      if (code === 'ALREADY_CLAIMED') {
        showNotice('Already claimed.')
      }
    }
  }

  // removed loadLeaderboard (not used in current UI build)

  useEffect(() => {
    if (userId && !session) {
      void (async () => {
        try { console.log(JSON.stringify({ event: 'client_session_loading' })) } catch {}
        try { console.log(JSON.stringify({ event: 'client_scaffold_on', reason: 'session' })) } catch {}
        await refreshDebug()
        await resumeOrStartSession()
        await loadTasks()
        try { console.log(JSON.stringify({ event: 'client_scaffold_off', reason: 'ready' })) } catch {}
        try { setBootScaffold(false) } catch {}
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Decide which modal to show exactly once per leveledUp value
  useEffect(() => {
    if (!leveledUp) return
    if (decisionForLevelRef.current === leveledUp && levelModalDecision !== 'unknown') return
    decisionForLevelRef.current = leveledUp
    setLevelModalDecision('unknown')
    setFreeTrialAtLevel(null)
    void (async () => {
      // Decide via level-based ready endpoint (decoupled from tasks)
      try {
        const res = await fetch(`/api/v1/offer/free-trial/level/${leveledUp}/ready`)
        if (res.ok) {
          const j = await res.json() as { ready?: boolean; taskId?: string }
          if (j?.ready && typeof j.taskId === 'string') {
            setPendingBonusConfirm(false)
            setFreeTrialAtLevel({ taskId: j.taskId, level: leveledUp })
            setLevelModalDecision('free_trial')
          } else {
            setLevelModalDecision('regular')
          }
        } else {
          setLevelModalDecision('regular')
        }
      } catch { setLevelModalDecision('regular') }
      // fetch level header (optional, does not affect decision)
      try {
        const res = await fetch('/api/v1/level/last')
        if (res.ok) {
          const data = await res.json().catch(() => null)
          if (data && typeof data.level === 'number') {
            setDebugState((s) => ({ ...(s || { counters: null, lastLevel: null, leaderboard: null, config: [] as { key: string; value: unknown }[] }), lastLevel: { level: data.level, reward_payload: data.rewardPayload, bonus_multiplier: null } }))
          }
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

  // removed unused refreshAll

  useEffect(() => setMounted(true), [])

  // Resilient Telegram detection with retry + UA fallback
  useEffect(() => {
    let tries = 0
    let cancelled = false
    const tick = () => {
      if (cancelled) return
      try {
        const w = window as WindowWithTelegram & { Telegram?: { WebApp?: TgWebApp & { initData?: string; ready?: () => void } } }
        const tg = w.Telegram?.WebApp
        if (tg) {
          // Only signal readiness; do not override insideTelegram without valid initData
          try { (tg as unknown as { ready?: () => void }).ready?.() } catch {}
          return
        }
        // UA fallback
        const ua = (typeof navigator !== 'undefined' ? navigator.userAgent : '').toLowerCase()
        if (ua.includes('telegram')) {
          // Do not set insideTelegram based on UA alone
          return
        }
      } catch {}
      tries += 1
      if (tries < 5) {
        setTimeout(tick, 200)
      }
    }
    tick()
    return () => { cancelled = true }
  }, [])

  // Compute dynamic clicker size for ergonomics (thumb-zone sizing)
  useEffect(() => {
    function recalc() {
      try {
        const vw = typeof window !== 'undefined' ? window.innerWidth : 360
        const vh = typeof window !== 'undefined' ? window.innerHeight : 640
        const base = Math.min(vw, vh) * 0.4 // 40% of the smaller viewport side
        const size = Math.max(128, Math.min(200, Math.round(base)))
        setClickerSize(size)
      } catch {}
    }
    recalc()
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [])

  // Read public config once and cache timers/limits
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/v1/config')
        if (!res.ok) return
        const obj = await res.json()
        const cfg = parsePublicConfig(obj)
        try { (window as unknown as TapWindow).__tapConfigCoinsPerTap = Number(cfg.coinsPerTap ?? 1) } catch {}
        setAdTTLSeconds(cfg.adTTLSeconds)
        setBatchMinIntervalMs(cfg.batchMinIntervalMs)
        if (typeof cfg.hudTweenMs === 'number') setHudTweenMs(cfg.hudTweenMs)
        if (typeof cfg.tapAggFlushThreshold === 'number') flushThresholdRef.current = cfg.tapAggFlushThreshold
        if (typeof cfg.ingestMaxBatch === 'number') ingestMaxBatchRef.current = cfg.ingestMaxBatch
        try {
          const ft = (typeof cfg.tapAggFlushThreshold === 'number') ? cfg.tapAggFlushThreshold : flushThresholdRef.current
          const imb = (typeof cfg.ingestMaxBatch === 'number') ? cfg.ingestMaxBatch : ingestMaxBatchRef.current
          const eff = Math.max(1, Math.min(ft || 1, (imb ?? Number.POSITIVE_INFINITY)))
          effectiveFlushRef.current = eff
        } catch {}
        if (typeof cfg.tapAggTweenMsMin === 'number') tweenMinRef.current = cfg.tapAggTweenMsMin
        if (typeof cfg.tapAggTweenMsMax === 'number') tweenMaxRef.current = cfg.tapAggTweenMsMax
        setMonetagEnabled(Boolean(cfg.monetagEnabled))
        setMonetagZoneId(cfg.monetagZoneId)
        setMonetagSdkUrl(cfg.monetagSdkUrl)
        // unlock policy is advisory for UI only in this build; omit unused setter
        setLogFailedAdEvents(Boolean(cfg.logFailedAdEvents))
      } catch {}
    })()
  }, [])

  // Flusher: coalesce pending taps at interval and size threshold
  const flushOnceRef = useRef<null | (() => Promise<void>)>(null)
  const flushOnceImpl = useCallback(async () => {
    if (!session) return
    if (inflightRef.current) return
    const now = Date.now()
    const since = now - lastFlushAtRef.current
    const threshold = Math.max(1, Math.min(flushThresholdRef.current || 1, (ingestMaxBatchRef.current ?? Number.POSITIVE_INFINITY)))
    const shouldByTime = since >= Math.max(50, batchMinIntervalMs)
    const shouldBySize = pendingTaps >= threshold
    if (!shouldByTime && !shouldBySize) return
    const toSend = pendingTaps
    if (toSend <= 0) return
    inflightRef.current = true
    const nextSeq = clientSeq + 1
    const { ok, json, status } = await fetchJsonWithRetry<unknown>('/api/v1/ingest/taps', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ taps: toSend, clientSeq: nextSeq, sessionId: session.sessionId, sessionEpoch: session.sessionEpoch }),
    }, {
      retry429DelayMs: batchMinIntervalMs,
      onOutdated: async () => { await resumeOrStartSession() },
    })
    if (ok) {
      const data = json as { counters: unknown; nextThreshold?: NextThreshold; leveledUp?: { level: number } | null }
      const c = normalizeCounters(data.counters)
      baseCountersRef.current = c
      setCounters(c)
      setClientSeq(nextSeq)
      setLeveledUp(data?.leveledUp?.level ?? null)
      if (data?.leveledUp?.level) { try { await refreshDebug() } catch {} }
      setNextThreshold(data?.nextThreshold ?? null)
      setPendingTaps((p) => Math.max(0, p - toSend))
      setDisplayCoins((prev) => (prev < c.coins ? c.coins : prev))
    } else {
      if (status !== 429 && status !== 409 && status !== 0) {
        try {
          const errText = typeof (json as { error?: unknown })?.error === 'string' ? (json as { error?: string }).error! : 'Something went wrong. Please try again.'
          showNotice(errText)
        } catch {
          showNotice('Something went wrong. Please try again.')
        }
      }
    }
    lastFlushAtRef.current = Date.now()
    inflightRef.current = false
  }, [session, clientSeq, batchMinIntervalMs, pendingTaps])
  flushOnceRef.current = flushOnceImpl
  useEffect(() => {
    if (!session) return
    const tick = async () => {
      if (inflightRef.current) return
      const now = Date.now()
      const since = now - lastFlushAtRef.current
      const threshold = Math.max(1, Math.min(flushThresholdRef.current || 1, (ingestMaxBatchRef.current ?? Number.POSITIVE_INFINITY)))
      const shouldByTime = since >= Math.max(50, batchMinIntervalMs)
      const shouldBySize = pendingTaps >= Math.max(1, threshold)
      if (!shouldByTime && !shouldBySize) return
      const toSend = pendingTaps
      if (toSend <= 0) return
      inflightRef.current = true
      const nextSeq = clientSeq + 1
      const { ok, json, status } = await fetchJsonWithRetry<unknown>('/api/v1/ingest/taps', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ taps: toSend, clientSeq: nextSeq, sessionId: session.sessionId, sessionEpoch: session.sessionEpoch }),
      }, {
        retry429DelayMs: batchMinIntervalMs,
        onOutdated: async () => { await resumeOrStartSession() },
      })
      if (ok) {
        const data = json as { counters: unknown; nextThreshold?: NextThreshold; leveledUp?: { level: number } | null }
        const c = normalizeCounters(data.counters)
        baseCountersRef.current = c
        setCounters(c)
        setClientSeq(nextSeq)
        setLeveledUp(data?.leveledUp?.level ?? null)
        if (data?.leveledUp?.level) { try { await refreshDebug() } catch {} }
        setNextThreshold(data?.nextThreshold ?? null)
        // reduce pending by sent count
        setPendingTaps((p) => Math.max(0, p - toSend))
        // ensure display is at least base coins
        setDisplayCoins((prev) => (prev < c.coins ? c.coins : prev))
      } else {
        // keep pending taps; show notice only for non-retryable errors
        if (status !== 429 && status !== 409 && status !== 0) {
          try {
            const errText = typeof (json as { error?: unknown })?.error === 'string' ? (json as { error?: string }).error! : 'Something went wrong. Please try again.'
            showNotice(errText)
          } catch {
            showNotice('Something went wrong. Please try again.')
          }
        }
      }
      lastFlushAtRef.current = Date.now()
      inflightRef.current = false
    }
    const id = setInterval(() => { void tick() }, Math.max(50, batchMinIntervalMs))
    return () => clearInterval(id)
  }, [session, clientSeq, batchMinIntervalMs, pendingTaps])

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
        let changed = false
        const next: typeof prev = { ...prev }
        for (const [key, u] of Object.entries(prev)) {
          if (!u || typeof u.expiresAt !== 'number') continue
          if (Date.now() > u.expiresAt) {
            delete next[key]
            try { sessionStorage.removeItem(`unlock:${key}`) } catch {}
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 500)
    return () => clearInterval(id)
  }, [adTTLSeconds])

  // Refresh tasks when entering EARN (offers) section — once per entry
  const offersRefreshedRef = useRef<boolean>(false)
  useEffect(() => {
    if (activeSection === 'offers') {
      if (!offersRefreshedRef.current) {
        offersRefreshedRef.current = true
        void loadTasks()
      }
    } else {
      offersRefreshedRef.current = false
    }
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

  // const isWallet = activeSection === 'wallet' // unused
  return (
    <main style={{
      padding: 0,
      paddingBottom: 0,
      fontFamily: 'ui-sans-serif, system-ui',
      maxWidth: undefined,
      margin: undefined,
      minHeight: 'calc(100dvh - (var(--bottomnav-height, 132px) + env(safe-area-inset-bottom)))'
    }}>
      {bootScaffold ? (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Preparing your session…</div>
          <div style={{ width: 40, height: 40, borderRadius: 9999, border: '3px solid rgba(0,0,0,0.15)', borderTopColor: 'rgba(0,0,0,0.6)', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : !userId ? (
        <div style={{ padding: 16 }}>
          {!insideTelegram && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {devAffordanceOutsideEnabled() ? (
                <button onClick={async () => { try { console.log(JSON.stringify({ event: 'client_dev_login_clicked_outside' })) } catch {}; await devLogin() }}>Dev login</button>
              ) : (
                <div style={{ fontSize: 14, opacity: 0.8 }}>Outside Telegram. Access denied.</div>
              )}
            </div>
          )}
          {insideTelegram && showDevChoice && (
            <div role="dialog" aria-modal="true" aria-label="Developer choice" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80 }} onClick={() => setShowDevChoice(false)}>
              <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(92vw, 420px)', borderRadius: 16, background: 'var(--background)', color: 'var(--foreground)', padding: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>Choose login mode</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={async () => { try { console.log(JSON.stringify({ event: 'client_dev_login_clicked', tgUserIdFromProbe })) } catch {}; await devLogin(); setShowDevChoice(false) }}>Dev Login</button>
                  <button onClick={async () => {
                    try {
                      const w = window as WindowWithTelegram & { Telegram?: { WebApp?: TgWebApp & { initData?: string } } }
                      const initDataRaw = (w.Telegram?.WebApp as unknown as { initData?: string })?.initData || ''
                      if (!initDataRaw) { try { console.log(JSON.stringify({ event: 'client_tg_login_no_initdata' })) } catch {}; setShowDevChoice(false); return }
                      try { console.log(JSON.stringify({ event: 'client_scaffold_on', reason: 'auth_tg_click' })) } catch {}
                      try { setBootScaffold(true) } catch {}
                      try { console.log(JSON.stringify({ event: 'client_tg_login_clicked' })) } catch {}
                      const res = await fetch('/api/v1/auth/tg', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ initDataRaw }) })
                      if (res.ok) {
                        const aj = await res.json().catch(() => ({} as { user?: { userId?: string } }))
                        const uid = String(aj?.user?.userId || '')
                        if (uid) { setUserId(uid); try { console.log(JSON.stringify({ event: 'client_tg_login_ok', userId: uid })) } catch {} }
                      }
                    } catch {}
                    setShowDevChoice(false)
                  }}>Telegram Login</button>
                </div>
              </div>
            </div>
          )}
          {/* Outside-Telegram Dev Choice modal removed: Dev login acts directly outside Telegram */}
        </div>
      ) : (
        <>
          {activeSection === 'home' && (
            <ScreenContainer>
              <div style={{ marginBottom: 8 }}>
                <HeaderHUD counters={(() => {
                  const t = Number(counters?.tickets ?? 0)
                  const lvl = Number(counters?.level ?? 0)
                  const coins = Number.isFinite(displayCoins) ? displayCoins : Number(counters?.coins ?? 0)
                  return { coins, tickets: t, level: lvl }
                })()} tweenMs={hudTweenMs} />
              </div>
              <AvatarRow />
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: '10dvh', paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
                  <div style={{ position: 'relative', width: clickerSize, height: clickerSize }}>
                    <RotatingTextRing sizePx={clickerSize} visible={ctaVisible} />
                    <EmojiClicker
                      size={clickerSize}
                      onTap={() => { tap() }}
                      coinMultiplier={Number(baseCountersRef.current?.coinMultiplier ?? counters?.coinMultiplier ?? 1)}
                      coinsPerTap={Number(((window as unknown as TapWindow)?.__tapConfigCoinsPerTap) ?? 1)}
                      haptics={true}
                    />
                  </div>
                </div>
              </div>
              <div style={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(18dvh + env(safe-area-inset-bottom))', display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 60 }}>
                <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
                  {Number(nextThreshold?.coins ?? 0) > 0 ? (
                    <div style={{ fontSize: 12, opacity: 0.75 }}>
                      {`Next Level: ${Number(nextThreshold?.coins ?? 0)} coins`}
                    </div>
                  ) : null}
                </div>
              </div>
            </ScreenContainer>
          )}

          {activeSection === 'offers' && (
            <ScreenContainer>
              <div style={{ marginTop: 8 }}>
                <EarnGrid
                  loading={tasksLoading}
                  available={Array.isArray(tasks)
                    ? (tasks as TaskDef[])
                        .filter((t) => t.state === 'available')
                        .map((t: TaskDef) => ({ taskId: t.taskId, rewardPayload: t.rewardPayload ?? null, state: t.state, kind: t.kind ?? null, unlockLevel: t.unlockLevel ?? null }))
                    : []}
                  completed={Array.isArray(tasks)
                    ? (tasks as TaskDef[])
                        .filter((t) => t.state === 'claimed')
                        .map((t: TaskDef) => ({ taskId: t.taskId, rewardPayload: t.rewardPayload ?? null, state: t.state, kind: t.kind ?? null, unlockLevel: t.unlockLevel ?? null }))
                    : []}
                  activeTab={offersTab}
                  onTabChange={setOffersTab}
                  onWatch={(taskId) => watchAdForTask(taskId)}
                  onClaim={(taskId) => claimTask(taskId)}
                  onPartnerOpen={(taskId) => {
                    // Optimistic unlock: flip CTA to Claim immediately
                    try { setUnlockForTask(taskId, 'free-trial', 60) } catch {}
                    // Focus-based readiness refresh
                    const onFocus = async () => {
                      try {
                        const res = await fetch(`/api/v1/tasks/${taskId}/ready`)
                        if (res.ok) {
                          const j = await res.json() as { ready: boolean; claimed: boolean }
                          if (!j.ready) {
                            // if not ready, clear optimistic unlock to avoid stale UI
                            clearUnlockForTask(taskId)
                          }
                          await loadTasks()
                        }
                      } catch {}
                    try { window.removeEventListener('focus', onFocus, { capture: true } as unknown as AddEventListenerOptions) } catch {}
                    }
                  try { window.addEventListener('focus', onFocus, { once: true, capture: true } as AddEventListenerOptions) } catch {}
                  }}
                  secondsLeft={(taskId) => {
                    const unlock = readUnlockForTask(taskId)
                    return unlock ? Math.max(0, Math.ceil((unlock.expiresAt - nowTick) / 1000)) : null
                  }}
                />
              </div>
            </ScreenContainer>
          )}

          {activeSection === 'wallet' && (
            <div>
              <Wallet
                address={walletAddress}
                balances={{ ton: 0, usdt: 0, coins: Number(counters?.coins ?? 0), tickets: Number(counters?.tickets ?? 0) }}
                onConnect={() => {
                  const v = window.prompt('Enter your public wallet address (demo only):') || ''
                  const trimmed = v.trim()
                  if (!trimmed) return
                  try { sessionStorage.setItem('wallet:address', trimmed) } catch {}
                  setWalletAddress(trimmed)
                }}
                onDisconnect={() => { try { sessionStorage.removeItem('wallet:address') } catch {}; setWalletAddress(null) }}
              />
            </div>
          )}
          {typeof leveledUp === 'number' && levelModalDecision !== 'unknown' && (
            levelModalDecision === 'free_trial' && freeTrialAtLevel ? (
              <FreeTrialLevelUpModal
                level={leveledUp}
                onOpen={() => { try { window.open(`/api/v1/offer/free-trial/level/${leveledUp}/modal-redirect`, '_blank', 'noopener,noreferrer') } catch {} }}
                onClose={async () => { setLeveledUp(null); setFreeTrialAtLevel(null); await loadCounters(); }}
                ctaLabel={'Open'}
              />
            ) : pendingBonusConfirm ? (
              <LevelUpModal
                level={leveledUp}
                rewards={(() => {
                  const rp = debugState?.lastLevel?.reward_payload as Record<string, unknown> | null
                  const coins = typeof rp?.coins === 'number' ? rp.coins : Number(rp?.coins ?? 0)
                  const tickets = typeof rp?.tickets === 'number' ? rp.tickets : Number(rp?.tickets ?? 0)
                  return { coins: coins * 2, tickets: tickets * 2 }
                })()}
                onClaimBase={claimLevelBonusX2}
                onStartAd={async () => { setPendingBonusConfirm(false); setLeveledUp(null); setBonusImpressionId(null); setBonusExpiresAt(null); await loadCounters() }}
                claimLabel={(() => {
                  const secs = bonusExpiresAt ? Math.max(0, Math.ceil((bonusExpiresAt - nowTick) / 1000)) : null
                  return secs !== null ? `Claim x2 (${secs}s)` : 'Claim x2'
                })()}
                bonusLabel={'Skip'}
                singleAction={true}
              />
            ) : (
              <LevelUpModal
                level={leveledUp}
                rewards={(() => {
                  const rp = debugState?.lastLevel?.reward_payload as Record<string, unknown> | null
                  const coins = typeof rp?.coins === 'number' ? rp.coins : Number(rp?.coins ?? 0)
                  const tickets = typeof rp?.tickets === 'number' ? rp.tickets : Number(rp?.tickets ?? 0)
                  return { coins, tickets }
                })()}
                onClaimBase={async () => { setLeveledUp(null); await loadCounters() }}
                onStartAd={startLevelBonus}
                claimLabel={'Claim'}
                bonusLabel={'BONUS'}
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
    const coinMult = toNumber((payload as Record<string, unknown>).coin_multiplier)
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
