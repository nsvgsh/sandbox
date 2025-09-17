'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './EmojiClicker.module.css'

type Particle = {
  id: number
  x: number
  y: number
  asset: string
}

export type EmojiClickerProps = {
  // Prefer using assets over emojis. Assets must be paths under /public (e.g. '/ui/emojis/Icon_Gold.Png').
  assets?: string[]
  emojis?: string[]
  onTap?: (label: string) => void
  size?: number
  className?: string
  haptics?: boolean
}

const DEFAULT_ASSETS = [
  '/ui/emojis/Icon_Adremove.Png',
  '/ui/emojis/Icon_Bag.Png',
  '/ui/emojis/Icon_Battle.Png',
  '/ui/emojis/Icon_Bolt.Png',
  '/ui/emojis/icon_Bomb_Bomb.Png',
  '/ui/emojis/icon_Bomb_Dynamite.Png',
  '/ui/emojis/icon_Bomb_LandMine.Png',
  '/ui/emojis/Icon_Book.Png',
  '/ui/emojis/Icon_Booster.Png',
  '/ui/emojis/Icon_Boots.Png',
  '/ui/emojis/Icon_Boxing Gloves.Png',
  '/ui/emojis/Icon_Cards.Png',
  '/ui/emojis/Icon_Chest.Png',
  '/ui/emojis/Icon_Chest_Open_l.png',
  '/ui/emojis/Icon_Chest_Open_m.png',
  '/ui/emojis/Icon_Chest_Open_s.png',
  '/ui/emojis/Icon_Clan.Png',
  '/ui/emojis/Icon_Clover.Png',
  '/ui/emojis/Icon_Compass.Png',
  '/ui/emojis/Icon_Crown.Png',
  '/ui/emojis/Icon_Dice.Png',
  '/ui/emojis/Icon_Dice_Yellow.Png',
  '/ui/emojis/Icon_DogGum.Png',
  '/ui/emojis/Icon_Egg.Png',
  '/ui/emojis/Icon_Emergency_Bag.Png',
  '/ui/emojis/Icon_Energy_Green.Png',
  '/ui/emojis/Icon_Energy_Yellow.Png',
  '/ui/emojis/Icon_Flippers.Png',
  '/ui/emojis/Icon_Food_Can.Png',
  '/ui/emojis/icon_Food_Meat.Png',
  '/ui/emojis/icon_Food_Pizza.Png',
  '/ui/emojis/icon_Food_Shell.Png',
  '/ui/emojis/Icon_Friends.Png',
  '/ui/emojis/Icon_GearWheels.Png',
  '/ui/emojis/Icon_Gem01_Blue.Png',
  '/ui/emojis/Icon_Gem01_Green.Png',
  '/ui/emojis/Icon_Gem01_Purple.Png',
  '/ui/emojis/Icon_Gem02_Hexagon_Blue.Png',
  '/ui/emojis/Icon_Gem02_Hexagon_Green.Png',
  '/ui/emojis/Icon_Gem02_Hexagon_Purple.Png',
  '/ui/emojis/Icon_Gem03_Diamond_Blue.Png',
  '/ui/emojis/Icon_Gem03_Diamond_Green.Png',
  '/ui/emojis/Icon_Gem03_Diamond_Purple.Png',
  '/ui/emojis/Icon_Gem04_Octagon_Blue.Png',
  '/ui/emojis/Icon_Gem04_Octagon_Purple.Png',
  '/ui/emojis/Icon_Gem04_Octagon_Red.Png',
  '/ui/emojis/Icon_Gem04_Octagon_Yellow.Png',
  '/ui/emojis/Icon_Gem_Pearl.Png',
  '/ui/emojis/Icon_Gems.Png',
  '/ui/emojis/Icon_Gift.Png',
  '/ui/emojis/Icon_Gold.Png',
  '/ui/emojis/Icon_Golden_Pass.Png',
  '/ui/emojis/Icon_Golds.Png',
  '/ui/emojis/Icon_Gps.Png',
  '/ui/emojis/Icon_Guild.Png',
  '/ui/emojis/Icon_Hammer.Png',
  '/ui/emojis/Icon_Heart.Png',
  '/ui/emojis/Icon_Horsesheos.Png',
  '/ui/emojis/Icon_Hourglass.Png',
  '/ui/emojis/Icon_Key_Bronze.Png',
  '/ui/emojis/Icon_Key_Gold.Png',
  '/ui/emojis/Icon_Key_Silver.Png',
  '/ui/emojis/Icon_Laurel.Png',
  '/ui/emojis/Icon_Lock.Png',
  '/ui/emojis/Icon_Magnetic.Png',
  '/ui/emojis/Icon_Mail.Png',
  '/ui/emojis/Icon_Mana.Png',
  '/ui/emojis/Icon_Map.Png',
  '/ui/emojis/Icon_Megaphone.Png',
  '/ui/emojis/Icon_Missile.Png',
  '/ui/emojis/Icon_News.Png',
  '/ui/emojis/Icon_Nut.Png',
  '/ui/emojis/Icon_Oil.Png',
  '/ui/emojis/Icon_Potion01_Blue.Png',
  '/ui/emojis/Icon_Potion01_Purple.Png',
  '/ui/emojis/Icon_Potion01_Red.Png',
  '/ui/emojis/Icon_Potion02_Green.Png',
  '/ui/emojis/Icon_Potion02_Purple.Png',
  '/ui/emojis/Icon_Potion02_Red.Png',
  '/ui/emojis/Icon_Pumkin.Png',
  '/ui/emojis/Icon_Quest.Png',
  '/ui/emojis/Icon_Ranking.Png',
  '/ui/emojis/Icon_Shield.Png',
  '/ui/emojis/Icon_Shop.Png',
  '/ui/emojis/Icon_Shovel.Png',
  '/ui/emojis/Icon_Star.Png',
  '/ui/emojis/Icon_Star_Red.Png',
  '/ui/emojis/Icon_Stopwatch.Png',
  '/ui/emojis/Icon_Sword.Png',
  '/ui/emojis/Icon_Target.Png',
  '/ui/emojis/Icon_Timer.Png',
  '/ui/emojis/Icon_Tooth.Png',
  '/ui/emojis/Icon_Trophy.Png'
].filter(Boolean)

const DEFAULT_EMOJIS = ['🍪', '🍋', '🍎', '🪙', '🎟', '⭐️', '💎']

// function getRandomDifferent<T>(arr: T[], current: T): T {
//   if (!arr.length) return current
//   if (arr.length === 1) return arr[0]
//   let next = arr[Math.floor(Math.random() * arr.length)]
//   let safety = 0
//   while (next === current && safety++ < 6) {
//     next = arr[Math.floor(Math.random() * arr.length)]
//   }
//   return next
// }

export function EmojiClicker(props: EmojiClickerProps) {
  const { assets = DEFAULT_ASSETS, emojis = DEFAULT_EMOJIS, onTap, size = 144, className, haptics = true } = props
  const sourceList = useMemo(() => (Array.isArray(assets) && assets.length > 0) ? assets : [], [assets])
  const labelList = useMemo(() => (sourceList.length ? sourceList.map((p) => p.split('/').pop() || 'icon') : emojis), [sourceList, emojis])
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [tapCount, setTapCount] = useState<number>(0)
  const [isPressing, setIsPressing] = useState<boolean>(false)
  const [particles, setParticles] = useState<Particle[]>([])
  const particleIdRef = useRef<number>(1)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const spanRef = useRef<HTMLSpanElement | null>(null)
  const [shapeRadius, setShapeRadius] = useState<number>(28)

  // Heuristic: adjust border radius by visual width ratio of the media (image or emoji fallback)
  useEffect(() => {
    const el = rootRef.current
    const e: HTMLElement | null = (imgRef.current as unknown as HTMLElement | null) || (spanRef.current as unknown as HTMLElement | null)
    if (!el || !e) return
    try {
      const rect = el.getBoundingClientRect()
      const er = e.getBoundingClientRect()
      const ratio = Math.max(0.5, Math.min(1.3, er.width / rect.width))
      // Wider emoji → smaller radius (pill-ish), narrow/square → larger radius (circle-ish)
      const radius = Math.round(size * (ratio > 0.9 ? 0.33 : ratio < 0.7 ? 0.45 : 0.4))
      setShapeRadius(radius)
    } catch {}
  }, [currentIndex, size])

  const pushParticle = useCallback((x: number, y: number, asset: string) => {
    setParticles((prev) => {
      const next: Particle[] = [...prev, { id: particleIdRef.current++, x, y, asset }]
      // pool limit
      if (next.length > 12) next.shift()
      return next
    })
  }, [])

  const handleHaptic = useCallback(() => {
    if (!haptics) return
    try {
      type Haptic = { impactOccurred?: (s: 'soft'|'medium'|'heavy') => void }
      type WebApp = { HapticFeedback?: Haptic }
      type TgWindow = Window & { Telegram?: { WebApp?: WebApp } }
      const w = (typeof window !== 'undefined' ? window : undefined) as TgWindow | undefined
      const hf = w?.Telegram?.WebApp?.HapticFeedback
      if (hf && typeof hf.impactOccurred === 'function') {
        hf.impactOccurred('soft')
      }
    } catch {}
  }, [haptics])

  const handleTap = useCallback((ev: React.PointerEvent<HTMLDivElement>) => {
    const el = rootRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ev.clientX - rect.left
    const y = ev.clientY - rect.top
    const currentAsset = sourceList.length ? sourceList[currentIndex % sourceList.length] : ''
    const currentLabel = labelList[currentIndex % labelList.length] || ''
    pushParticle(x, y, currentAsset)
    handleHaptic()
    setTapCount((c) => c + 1)
    if ((tapCount + 1) % 3 === 0) {
      if (sourceList.length >= 2) {
        // rotate to a different asset
        setCurrentIndex((idx) => {
          const nextIdx = Math.floor(Math.random() * sourceList.length)
          return nextIdx === idx ? (idx + 1) % sourceList.length : nextIdx
        })
      } else if (!sourceList.length && emojis.length >= 2) {
        // emoji fallback
        setCurrentIndex((idx) => {
          const nextIdx = Math.floor(Math.random() * emojis.length)
          return nextIdx === idx ? (idx + 1) % emojis.length : nextIdx
        })
      }
    }
    if (typeof onTap === 'function') onTap(currentLabel)
  }, [currentIndex, handleHaptic, labelList, onTap, pushParticle, sourceList, tapCount, emojis.length])

  const onPointerDown = useCallback(() => setIsPressing(true), [])
  const onPointerUp = useCallback(() => setIsPressing(false), [])
  const onPointerLeave = useCallback(() => setIsPressing(false), [])

  type ClickerStyle = React.CSSProperties & { ['--shape-radius']?: string }
  const rootStyle = useMemo<ClickerStyle>(() => ({
    width: size,
    height: size,
    ['--shape-radius']: `${shapeRadius}px`,
  }), [size, shapeRadius])

  const mediaStyle = useMemo<React.CSSProperties>(() => ({
    width: Math.round(size * 0.58),
    height: Math.round(size * 0.58),
    objectFit: 'contain',
  }), [size])

  return (
    <div ref={rootRef} className={[styles.root, className || ''].join(' ')} style={rootStyle}>
      <div
        role="button"
        aria-label={`Tap icon`}
        className={[styles.button, isPressing ? styles.pressed : styles.bounce].join(' ')}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onClick={(e) => e.preventDefault()}
        onPointerUpCapture={handleTap}
      >
        {sourceList.length ? (
          <img ref={imgRef} className={styles.media} style={mediaStyle} src={sourceList[currentIndex % sourceList.length]} alt="" />
        ) : (
          <span ref={spanRef} className={styles.media} style={{ fontSize: Math.round(size * 0.44), lineHeight: 1 }}>
            {emojis[currentIndex % emojis.length] || '🪙'}
          </span>
        )}
        <div className={styles.particles} aria-hidden>
          {particles.map((p) => (
            <span
              key={p.id}
              className={styles.particle}
              style={{ left: p.x, top: p.y }}
              onAnimationEnd={() => setParticles((prev) => prev.filter((x) => x.id !== p.id))}
            >
              <span className={styles.particleText}>+1</span>
              {p.asset ? (
                <img className={styles.particleIcon} src={p.asset} alt="" />
              ) : null}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmojiClicker


