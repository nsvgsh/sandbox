import React from 'react'
import styles from './EarnGrid.module.css'
import { Tile, EarnTile } from '../Tile/Tile'
import { EmptyState } from '../EmptyState/EmptyState'
import { TileSkeleton } from '../Skeletons/TileSkeleton'

// Deterministic icon selection based on taskId to avoid flicker on re-render
function stableIndex(id: string, n: number): number {
  if (!n || n <= 0) return 0
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  const v = h === -2147483648 ? 0 : Math.abs(h)
  return v % n
}

const ICONS_FREE_TRIAL = [
  '/ui/earnicons/Icon_ShopIcon_Gem4.png',
  '/ui/earnicons/Icon_ShopIcon_SpecialChest.png'
] as const
const ICONS_MONETAG = [
  '/ui/earnicons/Icon_ShopIcon_Gold4.png',
  '/ui/earnicons/Icon_ShopIcon_Gold3.png'
] as const

function iconSrcForTask(taskId: string, kind?: string | null): string {
  const k = (kind || '').toLowerCase()
  const arr = k === 'free-trial' ? ICONS_FREE_TRIAL : ICONS_MONETAG /* in_app */
  return arr[stableIndex(taskId, arr.length)]
}

export type EarnItem = {
  taskId: string
  rewardPayload: Record<string, unknown> | null
  state: 'available' | 'claimed' | string
  kind?: string | null
  unlockLevel?: number | null
}

export function EarnGrid(props: {
  available: EarnItem[] | null
  completed: EarnItem[] | null
  loading?: boolean
  activeTab: 'available' | 'completed'
  onTabChange: (tab: 'available' | 'completed') => void
  onWatch?: (taskId: string) => void
  onClaim?: (taskId: string) => void
  onPartnerOpen?: (taskId: string) => void
  secondsLeft?: (taskId: string) => number | null
}) {
  const { available, completed, loading, activeTab, onTabChange, onWatch, onClaim, onPartnerOpen, secondsLeft } = props

  const toTiles = (items: EarnItem[] | null): EarnTile[] => {
    if (!Array.isArray(items)) return []
    return items.map((it, idx) => ({
      id: it.taskId,
      badgeNumber: typeof it.unlockLevel === 'number' ? it.unlockLevel : (idx + 1),
      iconSrc: iconSrcForTask(it.taskId, it.kind),
      ctaLabel: 'Open',
      variant: 'primary',
    }))
  }

  const list = activeTab === 'available' ? toTiles(available) : toTiles(completed)

  return (
    <div className={styles.container}>
      <div className={styles.header} role="tablist" aria-label="Earn">
        {(['available','completed'] as const).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={[styles.tabBtn, activeTab === tab ? styles.tabBtnActive : ''].join(' ')}
            onClick={() => onTabChange(tab)}
            onPointerDown={(e) => { try { e.currentTarget.setAttribute('data-pressed', 'true') } catch {} }}
            onPointerUp={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
            onPointerCancel={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
            onPointerLeave={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (<TileSkeleton key={i} />))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState label={activeTab === 'available' ? 'No available offers' : 'No completed offers'} />
      ) : (
        <div className={styles.grid}>
          {(activeTab === 'available' ? (available || []) : (completed || [])).map((it, idx) => {
            const left = secondsLeft?.(it.taskId)
            const isUnlocked = typeof left === 'number' && left > 0
            const disabled = typeof left === 'number' && left <= 0
            const isPartner = (it.kind || '') === 'free-trial'
            // For partner: when unlocked (ready), show Claim; otherwise show partnerKey (debug) or Open
            const ctaLabel = isPartner
              ? (isUnlocked ? 'Claim' : 'Free')
              : (isUnlocked ? `Claim (${left}s)` : 'Open')
            const variant: 'primary' | 'confirm' | 'partner' = isPartner
              ? (isUnlocked ? 'confirm' : 'partner')
              : (isUnlocked ? 'confirm' : 'primary')
            const tile: EarnTile = {
              id: it.taskId,
              badgeNumber: typeof it.unlockLevel === 'number' ? it.unlockLevel : (idx + 1),
              iconSrc: iconSrcForTask(it.taskId, it.kind),
              ctaLabel,
              variant,
              disabled: isPartner ? false : disabled,
            }
            return (
              <Tile key={tile.id} tile={tile} onClick={(id) => {
                  if (activeTab !== 'available') return
                  if (isPartner) {
                    if (isUnlocked) {
                      onClaim?.(id)
                    } else {
                      try { onPartnerOpen?.(id) } catch {}
                      ;(async () => {
                        try {
                          const res = await fetch(`/api/v1/offer/free-trial/${id}/redirect?format=json`)
                          if (res.ok) {
                            const j = await res.json().catch(() => null) as { url?: string } | null
                            const finalUrl = j && typeof j.url === 'string' ? j.url : ''
                            if (finalUrl) {
                              try {
                                const w = window as unknown as { Telegram?: { WebApp?: { openLink?: (url: string, opts?: { try_instant_view?: boolean }) => void } } }
                                const openLink = w?.Telegram?.WebApp?.openLink
                                if (typeof openLink === 'function') {
                                  openLink(finalUrl, { try_instant_view: false })
                                } else {
                                  window.open(finalUrl, '_blank', 'noopener,noreferrer')
                                }
                              } catch { try { window.open(finalUrl, '_blank', 'noopener,noreferrer') } catch {} }
                            }
                          } else {
                            try { window.open(`/api/v1/offer/free-trial/${id}/redirect`, '_blank', 'noopener,noreferrer') } catch {}
                          }
                        } catch {
                          try { window.open(`/api/v1/offer/free-trial/${id}/redirect`, '_blank', 'noopener,noreferrer') } catch {}
                        }
                      })()
                    }
                    return
                  }
                  const leftNow = secondsLeft?.(id)
                  if (leftNow && leftNow > 0) {
                    onClaim?.(id)
                  } else {
                    onWatch?.(id)
                  }
                }} />
            )
          })}
        </div>
      )}
    </div>
  )
}
