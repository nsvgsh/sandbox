export type ThresholdsPoly = { a0?: number; a1?: number; a2?: number; a3?: number }
export type LevelRewardTemplate = { level: number; payload: Record<string, unknown> }
export type OfferSchedule = { level: number; active: boolean; skip_base_reward: boolean; partner: string; payload: Record<string, unknown>; taskId?: string }

export type Snapshot = {
  configVersion: string
  coinsPerTap: number
  thresholdsPoly: ThresholdsPoly
  levelRewardTemplates: LevelRewardTemplate[]
  levelOfferSchedule: OfferSchedule[]
}

export type LadderEntry = {
  level: number
  thresholdCoins: number
  kind: 'base_reward' | 'free_trial'
  payload?: Record<string, unknown>
  taskId?: string
}

export function thresholdForLevel(poly: ThresholdsPoly, level: number): number {
  const a0 = Number(poly.a0 ?? 156)
  const a1 = Number(poly.a1 ?? 800)
  const a2 = Number(poly.a2 ?? 195)
  const a3 = Number(poly.a3 ?? 7.36)
  const x = Number(level)
  const v = a0 + a1 * x + a2 * (x ** 2) + a3 * (x ** 3)
  return Math.floor(v)
}

function templateMap(templates: LevelRewardTemplate[]): Map<number, Record<string, unknown>> {
  const m = new Map<number, Record<string, unknown>>()
  for (const t of templates) m.set(Number(t.level), t.payload || {})
  return m
}

function offerMap(offers: OfferSchedule[]): Map<number, OfferSchedule> {
  const m = new Map<number, OfferSchedule>()
  for (const o of offers) if (o.active) m.set(Number(o.level), o)
  return m
}

export function buildLadderWindow(base: { coins: number; level: number }, snapshot: Snapshot, count = 10): LadderEntry[] {
  const entries: LadderEntry[] = []
  const tmap = templateMap(snapshot.levelRewardTemplates)
  const omap = offerMap(snapshot.levelOfferSchedule)
  let lvl = Number(base.level || 0)
  for (let i = 0; i < Math.max(1, count); i++) {
    const nextLevel = lvl + 1
    const thr = thresholdForLevel(snapshot.thresholdsPoly, nextLevel)
    const offer = omap.get(nextLevel)
    if (offer && offer.skip_base_reward) {
      entries.push({ level: nextLevel, thresholdCoins: thr, kind: 'free_trial', payload: offer.payload || {}, taskId: offer.taskId })
    } else {
      const payload = tmap.get(nextLevel)
      entries.push({ level: nextLevel, thresholdCoins: thr, kind: 'base_reward', payload })
    }
    lvl = nextLevel
  }
  return entries
}

export function crossedLevels(prevCoins: number, currCoins: number, ladder: LadderEntry[]): LadderEntry[] {
  const low = Math.min(prevCoins, currCoins)
  const high = Math.max(prevCoins, currCoins)
  return ladder.filter((e) => e.thresholdCoins > low && e.thresholdCoins <= high)
}


