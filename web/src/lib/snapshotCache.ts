import type { Snapshot } from './ladder'

const LATEST_KEY = 'snapshot:latest'

export function readCachedSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem(LATEST_KEY)
    if (!raw) return null
    const obj = JSON.parse(raw) as Snapshot & { _ts?: number }
    if (!obj || typeof obj !== 'object') return null
    return obj as Snapshot
  } catch { return null }
}

export function writeCachedSnapshot(s: Snapshot): void {
  try {
    localStorage.setItem(LATEST_KEY, JSON.stringify({ ...s, _ts: Date.now() }))
  } catch {}
}

