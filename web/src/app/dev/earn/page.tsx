"use client"
import React, { useMemo, useState } from 'react'
import { EarnGrid, EarnItem } from '@/ui/earn/EarnGrid/EarnGrid'

export default function DevEarnPage() {
  const [tab, setTab] = useState<'available'|'completed'>('available')
  const items = useMemo(() => ({
    available: [
      { taskId: 'task_aaaaaaaaaaaaaaa', rewardPayload: { coins: 100 }, state: 'available' },
      { taskId: 'task_bbbbbbbbbbbbbbb', rewardPayload: { coin_multiplier: 0.1 }, state: 'available' },
      { taskId: 'task_ccccccccccccccc', rewardPayload: { tickets: 1 }, state: 'available' },
    ] as EarnItem[],
    completed: [
      { taskId: 'task_xxxxxxxxxxxxxxx', rewardPayload: { coins: 50 }, state: 'claimed' },
    ] as EarnItem[],
  }), [])

  return (
    <main style={{ padding: 16 }}>
      <EarnGrid
        loading={false}
        available={items.available}
        completed={items.completed}
        activeTab={tab}
        onTabChange={setTab}
        onWatch={() => {}}
        onClaim={() => {}}
        secondsLeft={() => null}
      />
    </main>
  )
}
