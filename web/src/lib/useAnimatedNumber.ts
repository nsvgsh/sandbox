"use client"
import { useEffect, useRef, useState } from 'react'

export function useAnimatedNumber(target: number, durationMs: number): number {
  const [value, setValue] = useState<number>(target)
  const rafRef = useRef<number | null>(null)
  const fromRef = useRef<number>(target)
  const startRef = useRef<number>(0)

  useEffect(() => {
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      if (rafRef.current) { try { cancelAnimationFrame(rafRef.current) } catch {} rafRef.current = null }
      setValue(target)
      fromRef.current = target
      return
    }
    const from = value
    fromRef.current = from
    startRef.current = performance.now()
    if (rafRef.current) { try { cancelAnimationFrame(rafRef.current) } catch {} }
    const tick = () => {
      const now = performance.now()
      const t = Math.max(0, Math.min(1, (now - startRef.current) / durationMs))
      const ease = 1 - Math.pow(1 - t, 2) // ease-out quad
      const next = fromRef.current + (target - fromRef.current) * ease
      setValue(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) { try { cancelAnimationFrame(rafRef.current) } catch {} rafRef.current = null } }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs])

  return value
}


