import React from 'react'
import styles from './EmptyState.module.css'

export function EmptyState({ label }: { label: string }) {
  return <div className={styles.root}>{label}</div>
}
