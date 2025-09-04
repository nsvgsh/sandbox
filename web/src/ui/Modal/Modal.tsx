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
        {/* Removed global bottomnav stylesheet to avoid leaking html/body background styles */}
        <div className={styles.headline} id="levelup-headline">You have reached the Next Level!</div>
        <div className={styles.shield}>
          <div className={styles.levelNum} style={{ WebkitTextStroke: "0.03em #000000" }}>{level}</div>
        </div>
        <div className={styles.title} id="levelup-title">LEVEL UP!</div>

        <div className={styles.rewardsBox} id="levelup-rewards">
          <span className={styles.rewardsLabel}>REWARDS</span>
          <div className={styles.rewardsRow}>
            {typeof rewards.coins === "number" && (
              <div className={styles.rewardBtn} aria-hidden>
                <img className={styles.rewardBtnBg} src="/ui/bottomnav/assets/Button03_Blue.png" alt="" draggable={false} />
                <div className={styles.rewardBtnOverlay}>
                  <img className={styles.rewardBtnIcon} src="dev/ui/header/assets/ResourceBar_Icon_Gold.Png" 
                  style={{width: "50%" }} 
                  alt="" draggable={false} />
                  <span className={styles.rewardBtnLabel} style={{ WebkitTextStroke: "0.015em #000000", fontSize: "7vw" }}>{rewards.coins.toLocaleString()}</span>
                </div>
              </div>
            )}
            {typeof rewards.tickets === "number" && (
              <div className={styles.rewardBtn} aria-hidden>
                <img className={styles.rewardBtnBg} src="/ui/bottomnav/assets/Button03_Blue.png" alt="" draggable={false} />
                <div className={styles.rewardBtnOverlay}>
                  <img className={styles.rewardBtnIcon} src="/dev/ui/header/assets/Whisk_Purple_Ticket.png" 
                  // style={{ marginBottom: "12%", width: "90%" }} 
                  alt="" draggable={false} />
                  <span className={styles.rewardBtnLabel} style={{ WebkitTextStroke: "0.015em #000000", fontSize: "7vw" }}>{rewards.tickets}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionsItem}>
            <Button variant="primary" width="100%" height={55} onClick={onClaimBase}>
              <span
                style={{
                  WebkitTextStroke: "0.015em #000000",
                  filter: "drop-shadow(0 0.08em 0 #000000)",
                  transform: 'translateY(-4px)' // down; use negative to move up
                }}
              >
                Claim
              </span>
            </Button>
          </div>
          <div className={styles.actionsItem}>
            <Button variant="confirm" width="100%" height={55} onClick={onStartAd}>
              <span
                style={{
                  fontSize: "8vw",
                  WebkitTextStroke: "0.015em #000000",
                  filter: "drop-shadow(0 0.08em 0 #000000)",
                  transform: 'translateY(-2px)' // down; use negative to move up
                }}
              >
                X2 BONUS
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


