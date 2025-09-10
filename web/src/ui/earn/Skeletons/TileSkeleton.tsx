import React from 'react'
import styles from './TileSkeleton.module.css'

export function TileSkeleton() {
  return <div className={styles.root} aria-hidden="true" />
}
