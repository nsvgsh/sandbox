"use client";

import React from "react";
import styles from "./RewardPill.module.css";

export type RewardPillVariant = "blue" | "green" | "yellow";

export interface RewardPillProps {
  iconSrc: string;
  label: string | number;
  variant?: RewardPillVariant;
  /** Optional override for icon width as percentage of pill width */
  iconWidthPercent?: number;
}

export const RewardPill: React.FC<RewardPillProps> = ({ iconSrc, label, variant = "blue", iconWidthPercent }) => {
  const bgClass = variant === "green" ? styles.bgGreen : variant === "yellow" ? styles.bgYellow : styles.bgBlue;
  return (
    <div className={styles.root} aria-hidden>
      <div className={`${styles.bg} ${bgClass}`} />
      <div className={styles.overlay}>
        <img className={styles.icon} style={iconWidthPercent ? { width: `${iconWidthPercent}%` } : undefined} src={iconSrc} alt="" draggable={false} />
        <span className={styles.label}>{label}</span>
      </div>
    </div>
  );
}


