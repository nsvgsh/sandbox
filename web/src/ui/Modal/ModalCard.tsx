"use client"
import React from 'react'
import styles from './Modal.module.css'

export type ModalCardProps = {
  ariaLabel?: string
  ariaLabelledBy?: string
  headline?: React.ReactNode
  title?: React.ReactNode
  header?: React.ReactNode
  actions?: React.ReactNode
  twoRows?: boolean
  children?: React.ReactNode
  onClose?: () => void
}

export function ModalCard(props: ModalCardProps) {
  const { ariaLabel, ariaLabelledBy, headline, title, header, actions, twoRows, children, onClose } = props

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) {
      try { onClose?.() } catch {}
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label={ariaLabel} aria-labelledby={ariaLabelledBy} className={styles.overlay} onClick={handleOverlayClick}>
      <div className={twoRows ? `${styles.card} ${styles.cardTwoRows}` : styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.headerArea}>
          {header ?? (
            <>
              {headline ? <div className={styles.headline}>{headline}</div> : null}
              {title ? <div className={styles.title}>{title}</div> : null}
            </>
          )}
        </div>
        {children}
        {actions ? (
          <div className={styles.actions}>
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}


