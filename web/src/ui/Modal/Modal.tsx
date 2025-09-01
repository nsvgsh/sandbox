"use client";

import React from "react";
import styles from "./Modal.module.css";
import { Button } from "@/ui/Button/Button";

export interface LevelUpModalProps {
  level: number;
  rewards: { coins?: number; tickets?: number };
  onClaimBase: () => void;
  onStartAd: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ level, rewards, onClaimBase, onStartAd }) => {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="levelup-title" aria-describedby="levelup-rewards" className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.headline} id="levelup-headline">You have reached the Next Level!</div>
        <div className={styles.shield}>
          <div className={styles.levelNum}>{level}</div>
        </div>
        <div className={styles.title} id="levelup-title">LEVEL UP!</div>

        <div className={styles.rewardsBox} id="levelup-rewards">
          <span className={styles.rewardsLabel}>REWARDS</span>
          <div className={styles.rewardsRow}>
            {typeof rewards.coins === "number" && (
              <div className={styles.frameItem}>
                <div className={styles.frameInner}>
                  <div className={styles.frameIcon}>🪙</div>
                  <div className={styles.frameText}>{rewards.coins.toLocaleString()}</div>
                </div>
              </div>
            )}
            {typeof rewards.tickets === "number" && (
              <div className={styles.frameItem}>
                <div className={styles.frameInner}>
                  <div className={styles.frameIcon}>🎟</div>
                  <div className={styles.frameText}>{rewards.tickets}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionsItem}>
            <Button variant="primary" width="100%" height={80} onClick={onClaimBase}>Claim</Button>
          </div>
          <div className={styles.actionsItem}>
            <Button variant="confirm" width="100%" height={80} onClick={onStartAd}>X2 bonus</Button>
          </div>
        </div>
      </div>
    </div>
  );
};


