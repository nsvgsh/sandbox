"use client"

import React, { useEffect, useMemo, useRef } from 'react'
import styles from './RotatingTextRing.module.css'

type RingStyle = React.CSSProperties & {
  ['--ring-size']: string
  ['--ring-opacity']: number | string
  ['--ring-font-size']: string
  ['--spin-duration']: string
}

export function RotatingTextRing(props: {
  sizePx: number
  visible?: boolean
  degPerSec?: number
  className?: string
}) {
  const { sizePx, visible = true, degPerSec = 30, className } = props

  const fontSize = useMemo(() => {
    const base = Math.max(19, Math.min(25, Math.round(sizePx * 0.15)))
    return base
  }, [sizePx])

  const ringSize = useMemo(() => {
    const gap = Math.max(8, Math.min(18, Math.round(sizePx * 0.08)))
    const rButton = sizePx / 2
    const rText = rButton + gap + Math.round(fontSize * 0.3)
    return Math.max(sizePx + gap * 2, Math.round(rText * 2 + fontSize))
  }, [sizePx, fontSize])

  const radius = useMemo(() => Math.round(ringSize / 2 - fontSize * 0.5), [ringSize, fontSize])

  const pathIdRef = useRef<string>('ringPath-' + Math.random().toString(36).slice(2))

  const styleVars: RingStyle = {
    ['--ring-size']: `${ringSize}px`,
    ['--ring-opacity']: visible ? 1 : 0,
    ['--ring-font-size']: `${fontSize}px`,
    ['--spin-duration']: `${Math.max(4, Math.min(60, 360 / Math.max(10, degPerSec)))}s`,
  }

  // Split phrases: top and bottom
  const topText = 'START TAP'
  const bottomPrefix = 'TO EARN REAL '
  const bottomAccent = 'CASH'

  useEffect(() => {
    return () => {}
  }, [])

  return (
    <div className={[styles.root, className || ''].join(' ')} style={styleVars} aria-hidden>
      <svg className={[styles.svgWrap, styles.spin].join(' ')} viewBox={`${-ringSize/2} ${-ringSize/2} ${ringSize} ${ringSize}`} focusable="false" role="img" aria-hidden>
        <defs>
          <path id={pathIdRef.current} d={`M 0 0 m -${radius}, 0 a ${radius},${radius} 0 1,1 ${radius*2},0 a ${radius},${radius} 0 1,1 -${radius*2},0`} />
        </defs>
        {/* Top arc centered at top (25%) */}
        <text className={styles.text} dominantBaseline="middle" textAnchor="middle">
          <textPath xlinkHref={`#${pathIdRef.current}`} startOffset="25%">
            {topText}
          </textPath>
        </text>
        {/* Bottom arc centered at bottom (75%), with CASH accented */}
        <text className={styles.text} dominantBaseline="middle" textAnchor="middle">
          <textPath xlinkHref={`#${pathIdRef.current}`} startOffset="75%">
            {bottomPrefix}
            <tspan className={styles.accent}>{bottomAccent}</tspan>
          </textPath>
        </text>
      </svg>
    </div>
  )
}

export default RotatingTextRing
