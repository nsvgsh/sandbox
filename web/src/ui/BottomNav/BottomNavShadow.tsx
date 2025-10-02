'use client'
import React, { useEffect, useRef } from 'react'

type TabKey = 'home' | 'offers' | 'wallet'

export function BottomNavShadow({ active, onSelect, earnAttention, earnHasAvailable }: { active: TabKey; onSelect: (k: TabKey) => void; earnAttention?: boolean; earnHasAvailable?: boolean }) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const shadowRef = useRef<ShadowRoot | null>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    if (!shadowRef.current) {
      shadowRef.current = host.attachShadow({ mode: 'open' })
      const shadow = shadowRef.current

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/ui/bottomnav/bottomnav.css'

      const nav = document.createElement('nav')
      nav.className = 'bottomNav'
      nav.setAttribute('role', 'navigation')
      nav.setAttribute('aria-label', 'Main tabs')

      const tpl = (label: string, icon: string, key: TabKey) => {
        const btn = document.createElement('button')
        btn.className = 'imgBtn'
        btn.type = 'button'
        btn.setAttribute('aria-label', label)
        btn.addEventListener('click', (e) => { e.preventDefault(); onSelect(key) })
        // Tap feedback: pressed state
        const clearPressed = () => { try { btn.removeAttribute('data-pressed') } catch {} }
        btn.addEventListener('pointerdown', () => { btn.setAttribute('data-pressed', 'true') })
        btn.addEventListener('pointerup', clearPressed)
        btn.addEventListener('pointercancel', clearPressed)
        btn.addEventListener('pointerleave', clearPressed)

        const bg = document.createElement('img')
        bg.className = 'btnBg'
        bg.src = '/ui/bottomnav/assets/Button03_Blue.png'
        bg.alt = ''
        bg.draggable = false

        const overlay = document.createElement('div')
        overlay.className = 'btnOverlay'

        const iconImg = document.createElement('img')
        iconImg.className = 'btnIcon'
        iconImg.src = icon
        iconImg.alt = ''
        iconImg.draggable = false

        const labelSpan = document.createElement('span')
        labelSpan.className = 'btnLabel'
        labelSpan.textContent = label

        overlay.appendChild(iconImg)
        overlay.appendChild(labelSpan)

        btn.appendChild(bg)
        btn.appendChild(overlay)

        // Notification pill (hidden by default)
        if (key === 'offers') {
          const pill = document.createElement('div')
          pill.className = 'notifPill'
          pill.setAttribute('aria-hidden', 'true')
          btn.appendChild(pill)
        }

        btn.setAttribute('data-key', key)
        return btn
      }

      const items: Array<{ key: TabKey; label: string; icon: string }> = [
        { key: 'home', label: 'TAP', icon: '/ui/bottomnav/assets/Icon_ImageIcon_GemGold.png' },
        { key: 'offers', label: 'EARN', icon: '/ui/bottomnav/assets/Icon_ImageIcon_Gift_Purple.png' },
        { key: 'wallet', label: 'WALLET', icon: '/ui/bottomnav/assets/Icon_wallet_whisk.png' },
      ]

      items.forEach(({ key, label, icon }) => nav.appendChild(tpl(label, icon, key)))

      const frag = document.createDocumentFragment()
      frag.appendChild(link)
      frag.appendChild(nav)
      shadow.appendChild(frag)
    }

    const shadow = shadowRef.current
    if (!shadow) return
    function recomputeHeight() {
      try {
        if (!host) return
        const nav = shadow.querySelector<HTMLElement>('nav.bottomNav')
        const img = shadow.querySelector<HTMLImageElement>('img.btnBg')
        if (!nav || !img) return
        const btnEl = shadow.querySelector<HTMLButtonElement>('button.imgBtn')
        const navWidth = nav.clientWidth
        const measuredBtnWidth = btnEl ? btnEl.clientWidth : 0
        const btnWidth = measuredBtnWidth > 0 ? measuredBtnWidth : navWidth * 0.24
        const nw = img.naturalWidth
        const nh = img.naturalHeight
        if (!nw || !nh) return
        const btnBgHeight = btnWidth * (nh / nw)
        const pb = parseFloat(getComputedStyle(nav).paddingBottom || '0')
        const h = Math.round(pb + btnBgHeight / 3)
        host.style.height = `${h}px`
        try { document.documentElement.style.setProperty('--bottomnav-height', `${h}px`) } catch {}
      } catch {}
    }
    const bg = shadow.querySelector<HTMLImageElement>('img.btnBg')
    if (bg) {
      if (bg.complete) {
        recomputeHeight()
      } else {
        bg.addEventListener('load', recomputeHeight, { once: true })
      }
    }
    const ro = new ResizeObserver(() => recomputeHeight())
    const navEl = shadow.querySelector<HTMLElement>('nav.bottomNav')
    const firstBtn = shadow.querySelector<HTMLButtonElement>('button.imgBtn')
    if (navEl) ro.observe(navEl)
    if (firstBtn) ro.observe(firstBtn)
    window.addEventListener('resize', recomputeHeight)
    // Update active state attributes for accessibility and styling hooks
    const buttons = shadow.querySelectorAll<HTMLButtonElement>('button.imgBtn')
    buttons.forEach((btn) => {
      const key = btn.getAttribute('data-key') as TabKey | null
      if (!key) return
      const isActive = key === active
      if (isActive) {
        btn.setAttribute('data-state', 'active')
        btn.setAttribute('aria-current', 'page')
        btn.setAttribute('aria-selected', 'true')
      } else {
        btn.removeAttribute('data-state')
        btn.removeAttribute('aria-current')
        btn.setAttribute('aria-selected', 'false')
      }
      // Attention cue for EARN tile
      if (key === 'offers') {
        if (earnAttention) {
          btn.setAttribute('data-attention', 'true')
        } else {
          btn.removeAttribute('data-attention')
        }
        // Toggle red notification pill
        try {
          const pill = btn.querySelector('.notifPill') as HTMLDivElement | null
          if (pill) {
            if (earnHasAvailable) {
              pill.removeAttribute('hidden')
            } else {
              pill.setAttribute('hidden', 'true')
            }
          }
          // Accessibility hint in label
          const baseLabel = btn.getAttribute('aria-label') || 'EARN'
          if (earnHasAvailable) {
            btn.setAttribute('aria-label', `${baseLabel} — New items available`)
          } else {
            btn.setAttribute('aria-label', 'EARN')
          }
        } catch {}
      }
    })
    return () => {
      try { window.removeEventListener('resize', recomputeHeight) } catch {}
      try { ro.disconnect() } catch {}
    }
  }, [active, onSelect, earnAttention, earnHasAvailable])

  return (
    <div
      ref={hostRef}
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        height: 'var(--bottomnav-height, 132px)',
        pointerEvents: 'auto',
        zIndex: 50,
      }}
    >
    </div>
  )
}


