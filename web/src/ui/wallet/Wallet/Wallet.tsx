"use client"
import React from 'react'
import styles from './Wallet.module.css'
import { CTA } from '@/ui/wallet/components/CTA/CTA'
import { AssetRow } from '@/ui/wallet/components/AssetRow/AssetRow'
import { Tabs, TabsKey } from '@/ui/wallet/components/Tabs/Tabs'
import { formatAssetLabel } from '@/ui/wallet/helpers/format'

export type WalletBalances = { ton: number; usdt: number; coins: number; tickets: number }

export type WalletProps = {
  address: string | null
  balances: WalletBalances
  onConnect: () => void
  onDisconnect: () => void
}

export function Wallet(props: WalletProps) {
  const { address, balances, onConnect, onDisconnect } = props
  // unused id removed
  const [activeTab, setActiveTab] = React.useState<TabsKey>('withdrawals')

  const labelForAddress = React.useMemo(() => {
    if (!address) return ''
    return address.length > 14 ? `${address.slice(0, 6)}…${address.slice(-6)}` : address
  }, [address])

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.glowShape} aria-hidden="true"></div>
        <section className={styles.panel} aria-label="Wallet overview">
          <header className={styles.header} aria-label="Wallet header">
            <h1 className={styles.title}>Wallet</h1>
            <p className={styles.note}>We store only your public wallet address.<br/>You are the only one with access to your funds.</p>
          </header>

          <section className={styles.connect} aria-label="Connect wallet">
            {!address ? (
              <CTA ariaLabel="Connect wallet" label="Connect wallet" onClick={onConnect} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, border: '1px solid var(--card-border)', borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Connected address</div>
                  <div style={{ fontWeight: 600 }}>{labelForAddress}</div>
                </div>
                <button onClick={onDisconnect} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid var(--card-border)' }}>Disconnect</button>
              </div>
            )}
          </section>

          <div className={styles.divider} role="separator" aria-hidden="true"></div>

          <section className={styles.assets} aria-label="Assets">
            <h2 className={styles.sectionTitle}>Assets</h2>
            <ul className={styles.assetList}>
              <AssetRow iconSrc={'/ui/wallet/Ton%20Icon.png'} iconAlt={'TON'} label={formatAssetLabel(`${Number(balances.ton).toFixed(2)} TON`)} actionLabel={'Deposit'} />
              <AssetRow iconSrc={'/ui/wallet/USDT%20Icons.png'} iconAlt={'USDT'} label={formatAssetLabel(`${Number(balances.usdt).toFixed(2)} USDT`)} actionLabel={'Withdraw'} />
              <AssetRow iconSrc={'/ui/wallet/Icon_Golds.Png'} iconAlt={'Coins'} label={formatAssetLabel(`${balances.coins} Coins`)} actionLabel={'Convert'} />
              <AssetRow iconSrc={'/ui/header/Whisk_Purple_Ticket.png'} iconAlt={'Tickets'} label={formatAssetLabel(`${balances.tickets} Tickets`)} actionLabel={'Get more'} />
            </ul>
          </section>
        </section>

        <section className={styles.panel} aria-label="Wallet tabs">
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            render={(k) => (
              k === 'withdrawals' ? (
                <>
                  <p className={styles.muted} style={{ margin: '4px 0' }}>No withdrawal requests yet.</p>
                  <p className={styles.muted}>Payouts are processed within 72 hours after request.</p>
                </>
              ) : k === 'deposits' ? (
                <p className={styles.muted} style={{ margin: '4px 0' }}>No deposits yet.</p>
              ) : (
                <p className={styles.muted} style={{ margin: '4px 0' }}>No airdrops available.</p>
              )
            )}
          />
        </section>
      </div>
    </div>
  )
}


