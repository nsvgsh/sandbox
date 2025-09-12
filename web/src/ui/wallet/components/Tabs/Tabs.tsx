"use client"
import React, { useId } from 'react'
import styles from './Tabs.module.css'

export type TabsKey = 'withdrawals' | 'deposits' | 'airdrop'

export function Tabs(props: {
  value: TabsKey
  onChange: (k: TabsKey) => void
  render: (k: TabsKey) => React.ReactNode
}) {
  const { value, onChange, render } = props
  const baseId = useId()
  const keys: TabsKey[] = ['withdrawals','deposits','airdrop']
  return (
    <section aria-label="Tabs">
      <div className={styles.tablist} role="tablist" aria-label="Wallet sections">
        {keys.map((k) => {
          const id = `${baseId}-tab-${k}`
          const panelId = `${baseId}-panel-${k}`
          const isActive = value === k
          return (
            <button
              key={k}
              id={id}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
              onClick={() => onChange(k)}
            >
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </button>
          )
        })}
      </div>
      <div className={styles.panels}>
        {keys.map((k) => {
          const id = `${baseId}-panel-${k}`
          const tabId = `${baseId}-tab-${k}`
          const isActive = value === k
          return (
            <div key={k} id={id} role="tabpanel" aria-labelledby={tabId} hidden={!isActive} className={styles.panel}>
              {render(k)}
            </div>
          )
        })}
      </div>
    </section>
  )
}


