"use client"
import React from 'react'
import styles from './CTA.module.css'

export function CTA(props: { label: string; onClick?: () => void; ariaLabel?: string }) {
  const { label, onClick, ariaLabel } = props
  return (
    <button
      type="button"
      aria-label={ariaLabel || label}
      onClick={onClick}
      className={styles.cta}
      onPointerDown={(e) => { try { e.currentTarget.setAttribute('data-pressed', 'true') } catch {} }}
      onPointerUp={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
      onPointerCancel={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
      onPointerLeave={(e) => { try { e.currentTarget.removeAttribute('data-pressed') } catch {} }}
    >
      <span className={styles.label}>{label}</span>
    </button>
  )
}


