'use client'
import React from 'react'
import { Wallet } from '@/ui/wallet/Wallet/Wallet'

export default function DevWalletPage() {
  const [address, setAddress] = React.useState<string | null>(null)
  return (
    <main style={{ padding: 16, maxWidth: 520, margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'ui-sans-serif, system-ui', marginBottom: 12 }}>Dev / Wallet</h1>
      <Wallet
        address={address}
        balances={{ ton: 0, usdt: 0, coins: 12345, tickets: 27 }}
        onConnect={() => {
          const v = window.prompt('Enter your public wallet address (demo only):') || ''
          const trimmed = v.trim()
          if (!trimmed) return
          try { sessionStorage.setItem('wallet:address', trimmed) } catch {}
          setAddress(trimmed)
        }}
        onDisconnect={() => { try { sessionStorage.removeItem('wallet:address') } catch {}; setAddress(null) }}
      />
    </main>
  )
}


