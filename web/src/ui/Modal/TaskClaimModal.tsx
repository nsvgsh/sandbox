"use client"
import React from 'react'
import { ModalCard } from './ModalCard'
import styles from './Modal.module.css'
import { AssetRow } from '@/ui/wallet/components/AssetRow/AssetRow'
import { formatAssetLabel } from '@/ui/wallet/helpers/format'

export function TaskClaimModal(props: { rewardPayload: Record<string, unknown> | null; onClose: () => void }) {
  const { rewardPayload, onClose } = props

  function toNumber(x: unknown): number | null {
    const n = typeof x === 'number' ? x : typeof x === 'string' ? Number(x) : NaN
    return Number.isFinite(n) ? n : null
  }

  const coins = toNumber(rewardPayload?.coins)
  const tickets = toNumber((rewardPayload as Record<string, unknown> | null)?.tickets)

  const rows: Array<{ icon: string; alt: string; label: string }> = []
  if (coins !== null) rows.push({ icon: '/ui/wallet/Icon_Golds.Png', alt: 'Coins', label: formatAssetLabel(`${coins} Coins`) })
  if (tickets !== null) rows.push({ icon: '/ui/header/Whisk_Purple_Ticket.png', alt: 'Tickets', label: formatAssetLabel(`${tickets} Tickets`) })

  return (
    <ModalCard ariaLabel="Task claimed" title={<span>Congratulations!</span>} onClose={onClose}>
      <div className={styles.rewardsBox}>
        <span className={styles.rewardsLabel}>REWARD</span>
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0 0', display: 'grid', gap: 8 }}>
          {rows.length > 0 ? rows.map((r, idx) => (
            <AssetRow key={idx} iconSrc={r.icon} iconAlt={r.alt} label={r.label} readonly />
          )) : (
            <li style={{ color: 'var(--fg)', opacity: 0.8 }}>No rewards</li>
          )}
        </ul>
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.ctaButton} aria-label="Close" style={{ width: '100%', maxWidth: 280 }}>
            <span className={styles.actionLabel}>Close</span>
          </button>
        </div>
      </div>
    </ModalCard>
  )
}


