import React from 'react'
import styles from './Badge.module.css'

export function Badge({ number }: { number: number | string }) {
  return (
    <div className={styles.root} aria-hidden="true">
      <img className={styles.img} src="/ui/earn/CardFrame01_Icon.png" alt="" />
      <span className={styles.num}>{number}</span>
    </div>
  )
}
