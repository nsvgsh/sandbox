"use client";

import React from "react";
import styles from "./Modal.module.css";
import { Button } from "@/ui/Button/Button";
import { RewardPill } from "@/ui/shared/RewardPill/RewardPill";

export interface LevelUpModalProps {
  level: number;
  rewards: { coins?: number; tickets?: number };
  onClaimBase: () => void;
  onStartAd: () => void;
  claimLabel?: string;
  bonusLabel?: string;
  singleAction?: boolean;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, rewards, onClaimBase, onStartAd, claimLabel, bonusLabel, singleAction }) => {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="levelup-title" aria-describedby="levelup-rewards" className={styles.overlay}>
      <div className={styles.card}>
        {/* Grid Row 1: header area (50%) */}
        <div className={styles.headerArea}>
          <div className={styles.headline} id="levelup-headline">You have reached the Next Level!</div>
          <div className={styles.shield}>
            <div className={styles.levelNum}>{level}</div>
          </div>
          <div className={styles.title} id="levelup-title">LEVEL UP!</div>
        </div>

        {/* Grid Row 2: rewards area (30%) */}
        <div className={styles.rewardsBox} id="levelup-rewards">
          <span className={styles.rewardsLabel}>REWARDS</span>
          <div className={styles.rewardsRow}>
            {typeof rewards.coins === "number" && (
              <RewardPill iconSrc="/ui/header/ResourceBar_Icon_Gold.png" label={rewards.coins.toLocaleString()} variant="blue" />
            )}
            {typeof rewards.tickets === "number" && (
              <RewardPill iconSrc="/ui/header/Whisk_Purple_Ticket.png" label={rewards.tickets} variant="blue" iconWidthPercent={70} />
            )}
          </div>
        </div>

        {/* Grid Row 3: CTAs area (20%) */}
        <div className={styles.actions}>
          <div className={styles.actionsItem}>
            <Button variant="primary" className={styles.ctaButton} width="100%" onClick={onClaimBase}>
              <span className={styles.actionLabel}>{claimLabel ?? 'Claim'}</span>
            </Button>
          </div>
          {!singleAction && (
            <div className={styles.actionsItem}>
              <Button variant="confirm" className={styles.ctaButton} width="100%" onClick={onStartAd}>
                <span className={styles.actionLabel}>{bonusLabel ?? 'BONUS'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


