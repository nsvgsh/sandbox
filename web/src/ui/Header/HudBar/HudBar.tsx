"use client"
import React from 'react'
import styles from './HudBar.module.css'

export type HudBarProps = {
  label: string
  value: string
  iconSrc: string
  tone?: 'dark' | 'gold' | 'purple'
  loading?: boolean
  style?: (React.CSSProperties & { ['--icon-size']?: string }) | undefined
}

export function HudBar(props: HudBarProps) {
  const { label, value, iconSrc, tone = 'dark', loading, style } = props
  const barStyle = {
    ['--bar-color']: tone === 'gold' ? '#270E0C' : tone === 'purple' ? '#0B143B' : '#270E0C',
  } as React.CSSProperties
  return (
    <div className={styles.pair} style={{ ...barStyle, ...(style || {}) }} aria-label={`${label} ${value}`}>
      <img className={styles.icon} src={iconSrc} alt="" draggable={false} />
      <span className={styles.text}>{loading ? '…' : `${value}`}</span>
    </div>
  )
}


