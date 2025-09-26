"use client";

import React, { useEffect, useState } from "react";
import base from "./Modal.module.css";
import ft from "./FreeTrialModal.module.css";
import { Button } from "@/ui/Button/Button";

export interface FreeTrialLevelUpModalProps {
  level: number;
  onOpen: () => void; // open partner (non-claimable) redirect
  onClose: () => void;
  assetSrc?: string; // optional PNG placeholder/asset inside rewards area
  ctaLabel?: string; // defaults to "Try for FREE"
}

export const FreeTrialLevelUpModal: React.FC<FreeTrialLevelUpModalProps> = ({ level, onOpen, onClose, assetSrc, ctaLabel }) => {
  const src = assetSrc || "/ui/levelup/free-trial/Congrats-Access-Banner.png";
  const [hasOpened, setHasOpened] = useState(false)
  const [hasReturned, setHasReturned] = useState(false)

  useEffect(() => {
    if (!hasOpened || hasReturned) return
    const onFocus = () => { try { setHasReturned(true) } catch {} }
    try { window.addEventListener('focus', onFocus, { once: true } as AddEventListenerOptions) } catch {}
    return () => { try { window.removeEventListener('focus', onFocus, { capture: false } as AddEventListenerOptions) } catch {} }
  }, [hasOpened, hasReturned])

  const handleOpen = () => {
    try { setHasOpened(true) } catch {}
    try { onOpen() } catch {}
  }
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="ft-levelup-title" className={base.overlay} onClick={onClose}>
      <div className={[base.card, ft.ftCard].join(' ')} onClick={(e) => e.stopPropagation()}>
        {!hasReturned && (
          <button aria-label="Close" className={ft.closeX} onClick={onClose}>×</button>
        )}
        {/* Row 1: header area (same as regular modal) */}
        <div className={base.headerArea}>
          <div className={base.headline} id="ft-levelup-headline">You have reached the Next Level!</div>
          <div className={base.shield}>
            <div className={base.levelNum}>{level}</div>
          </div>
          <div className={base.title} id="ft-levelup-title">LEVEL UP!</div>
        </div>

        {/* Row 2: expanded rewards area with asset + single CTA (no internal scroll) */}
        <div className={[base.rewardsBox, ft.ftRewardsExpanded, ft.ftNoScroll].join(' ')}>
          <div className={ft.ftAssetWrap}>
            <img src={src} alt="Free Trial" className={ft.ftAssetImg} draggable={false} />
          </div>
          <div className={ft.ftCtaWrap}>
            {hasReturned ? (
              <Button variant="confirm" className={[base.ctaButton, ft.ftCtaPurple].join(' ')} width="100%" onClick={onClose}>
                <span className={base.actionLabel}>Back to TAP</span>
              </Button>
            ) : (
              <Button variant="confirm" className={base.ctaButton} width="100%" onClick={handleOpen}>
                <span className={base.actionLabel}>{ctaLabel ?? 'Try for FREE'}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


