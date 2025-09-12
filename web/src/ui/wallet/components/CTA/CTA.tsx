"use client"
import React from 'react'
import styles from './CTA.module.css'

export function CTA(props: { label: string; onClick?: () => void; ariaLabel?: string }) {
  const { label, onClick, ariaLabel } = props
  return (
    <button type="button" aria-label={ariaLabel || label} onClick={onClick} className={styles.cta}>
      <span className={styles.label}>{label}</span>
    </button>
  )
}


