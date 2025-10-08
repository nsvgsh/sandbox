export type BaseRewardModal = { id: string; kind: 'base_reward'; level: number; payload?: Record<string, unknown> }
export type FreeTrialModal = { id: string; kind: 'free_trial'; level: number; partner?: string; payload?: Record<string, unknown>; taskId?: string }
export type X2OfferModal = { id: string; kind: 'x2_offer'; level: number }
export type ModalItem = BaseRewardModal | FreeTrialModal | X2OfferModal

export class ModalQueue {
  private q: ModalItem[] = []

  enqueue(m: ModalItem): void {
    this.q.push(m)
  }

  peek(): ModalItem | undefined {
    return this.q[0]
  }

  dequeue(): ModalItem | undefined {
    return this.q.shift()
  }

  size(): number {
    return this.q.length
  }

  clear(): void {
    this.q = []
  }
}


