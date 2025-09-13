import React from 'react'
import styles from './Tile.module.css'
import { Badge } from '../Badge/Badge'

export type EarnTile = {
  id: string
  badgeNumber: number
  icon: 'chest' | 'target'
  ctaLabel?: string
  disabled?: boolean
}

export function Tile({ tile, onClick }: { tile: EarnTile; onClick?: (id: string) => void }) {
  const iconSrc = tile.icon === 'target' ? '/ui/earn/Icon_Target.Png' : '/ui/earn/Icon_Chest.Png'
  return (
    <div className={styles.root}>
      <div className={styles.badge}>
        <Badge number={tile.badgeNumber} />
      </div>
      <div className={styles.card} role="group" aria-label="Earn item">
        <img className={styles.icon} src={iconSrc} alt="" draggable={false} />
        <button
          className={styles.cta}
          type="button"
          onPointerDown={(e) => { try { e.currentTarget.setAttribute('data-pressed', 'true') } catch {} }}
          onPointerUp={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {}; onClick?.(tile.id) }}
          onPointerCancel={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          onPointerLeave={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
          disabled={tile.disabled}
        >
          <span className={styles.ctaLabel}>{tile.ctaLabel ?? 'Open'}</span>
        </button>
      </div>
    </div>
  )
}
