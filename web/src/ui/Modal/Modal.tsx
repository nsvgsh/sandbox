"use client";

import React from "react";
import styles from "./Modal.module.css";
import { Button } from "@/ui/Button/Button";
import { RewardPill } from "@/ui/shared/RewardPill/RewardPill";
import { ModalCard } from "./ModalCard";

export interface LevelUpModalProps {
  level: number;
  rewards: { multiplier?: number; tickets?: number };
  onClaimBase: () => void;
  onStartAd: () => void;
  claimLabel?: string;
  bonusLabel?: string;
  singleAction?: boolean;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, rewards, onClaimBase, onStartAd, claimLabel, bonusLabel, singleAction }) => {
  const formatMultiplier = (v: number) => {
    try {
      const n = Number(v);
      if (!Number.isFinite(n)) return 'x1.00';
      return `x${n.toFixed(2)}`;
    } catch { return 'x1.00' }
  }
  return (
    <ModalCard ariaLabel="Level up" ariaLabelledBy="levelup-title" header={
      <>
        <div className={styles.headline} id="levelup-headline">You have reached the Next Level!</div>
        <div className={styles.shield}>
          <div className={styles.levelNum}>{level}</div>
        </div>
        <div className={styles.title} id="levelup-title">LEVEL UP!</div>
      </>
    }>
      <div className={styles.rewardsBox} id="levelup-rewards">
        <span className={styles.rewardsLabel}>REWARDS</span>
        <div className={styles.rewardsRow}>
          {typeof rewards.multiplier === "number" && (
            <RewardPill iconSrc="/dev/ui/modal/assets/Icon_Energy_Green.Png" label={formatMultiplier(rewards.multiplier)} variant="blue" />
          )}
          {typeof rewards.tickets === "number" && (
            <RewardPill iconSrc="/ui/header/Whisk_Purple_Ticket.png" label={rewards.tickets} variant="blue" iconWidthPercent={70} />
          )}
        </div>
      </div>
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
    </ModalCard>
  );
};


