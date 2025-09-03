'use client'
import React, { useEffect, useRef } from 'react'

type TabKey = 'home' | 'offers' | 'wallet'

export function BottomNavShadow({ active, onSelect }: { active: TabKey; onSelect: (k: TabKey) => void }) {
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
        btn.addEventListener('click', (e) => { e.preventDefault(); onSelect(key) })

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
    // Update active state by adjusting font-weight/opacity via style vars per button
    const buttons = shadow.querySelectorAll<HTMLButtonElement>('button.imgBtn')
    buttons.forEach((btn) => {
      const key = btn.getAttribute('data-key') as TabKey | null
      if (!key) return
      const label = btn.querySelector<HTMLElement>('.btnLabel')
      if (!label) return
      if (key === active) {
        label.style.fontWeight = '400'
      } else {
        label.style.fontWeight = '400'
      }
    })
  }, [active, onSelect])

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


