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
          <div className={styles.levelNum}>{level}</div>
        </div>
        <div className={styles.title} id="levelup-title">LEVEL UP!</div>

        <div className={styles.rewardsBox} id="levelup-rewards">
          <span className={styles.rewardsLabel}>REWARDS</span>
          <div className={styles.rewardsRow}>
            {typeof rewards.coins === "number" && (
              <button className={styles.rewardBtn} type="button" aria-hidden>
                <img className={styles.rewardBtnBg} src="/ui/bottomnav/assets/Button03_Blue.png" alt="" draggable={false} />
                <div className={styles.rewardBtnOverlay}>
                  <img className={styles.rewardBtnIcon} src="dev/ui/header/assets/ResourceBar_Icon_Gold.Png" alt="" draggable={false} />
                  <span className={styles.rewardBtnLabel} style={{ fontSize: "7vw" }}>{rewards.coins.toLocaleString()}</span>
                </div>
              </button>
            )}
            {typeof rewards.tickets === "number" && (
              <button className={styles.rewardBtn} type="button" aria-hidden>
                <img className={styles.rewardBtnBg} src="/ui/bottomnav/assets/Button03_Blue.png" alt="" draggable={false} />
                <div className={styles.rewardBtnOverlay}>
                  <img className={styles.rewardBtnIcon} src="/dev/ui/header/assets/Whisk_Purple_Ticket.png" style={{ marginBottom: "20%", width: "90%" }} alt="" draggable={false} />
                  <span className={styles.rewardBtnLabel} style={{ fontSize: "7vw" }}>{rewards.tickets}</span>
                </div>
              </button>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.actionsItem}>
            <Button variant="primary" width="100%" height={80} onClick={onClaimBase}>
              <span
                style={{
                  fontFamily: "'Lilita One', sans-serif",
                  fontSize: "9vw",
                  fontWeight: "var(--label-weight, 350)",
                  // letterSpacing: "-0.025em",
                  color: "var(--label-color, #ffffff)",
                  // WebkitTextStroke: "0.025em #000000",
                  filter: "drop-shadow(0 0.025em 0 #000000)",
                  display: 'inline-block',
                  transform: 'translateY(-3px)' // down; use negative to move up
                }}
              >
                Claim
              </span>
            </Button>
          </div>
          <div className={styles.actionsItem}>
            <Button variant="confirm" width="100%" height={80} onClick={onStartAd}>
              <span
                style={{
                  fontFamily: "'Lilita One', sans-serif",
                  fontSize: "7vw",
                  fontWeight: "var(--label-weight, 350)",
                  // letterSpacing: "-0.025em",
                  color: "var(--label-color, #ffffff)",
                  // WebkitTextStroke: "0.025em #000000",
                  filter: "drop-shadow(0 0.025em 0 #000000)",
                  display: 'inline-block',
                  transform: 'translateY(-1px)' // down; use negative to move up
                }}
              >
                X2 bonus
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};


