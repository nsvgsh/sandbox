"use client"
import React from 'react'
import styles from './ScreenContainer.module.css'

export function ScreenContainer(props: { children: React.ReactNode; className?: string }) {
  const { children, className } = props
  return (
    <div className={styles.root}>
      <div className={`${styles.container} ${className || ''}`}>{children}</div>
    </div>
  )
}


