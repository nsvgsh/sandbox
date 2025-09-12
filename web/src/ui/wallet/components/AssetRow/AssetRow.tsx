"use client"
import React from 'react'
import styles from './AssetRow.module.css'

export type AssetRowProps = {
  iconSrc: string
  iconAlt: string
  label: string
  actionLabel?: string
  onAction?: () => void
  readonly?: boolean
}

export function AssetRow(props: AssetRowProps) {
  const { iconSrc, iconAlt, label, actionLabel, onAction, readonly } = props
  return (
    <li className={readonly ? `${styles.row} ${styles.rowReadonly}` : styles.row}>
      <img className={styles.icon} src={iconSrc} alt={iconAlt} draggable={false} />
      <div className={styles.label}>{label}</div>
      {!readonly && actionLabel ? (
        <button className={styles.action} type="button" onClick={onAction} aria-label={actionLabel}>
          <span className={styles.actionLabel}>{actionLabel}</span>
        </button>
      ) : null}
    </li>
  )
}


