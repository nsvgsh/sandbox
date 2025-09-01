"use client";

import React from "react";
import styles from "./CoinsBar.module.css";

export interface CoinsBarProps {
  value: number;
  className?: string;
}

export const CoinsBar: React.FC<CoinsBarProps> = ({ value, className }) => {
  return (
    <div className={`${styles.wrap}${className ? ` ${className}` : ""}`}>
      <div className={styles.coinsBar}>
        <div className={styles.coinsText}>{value.toLocaleString()}</div>
        <div className={styles.coinIcon} aria-hidden="true" />
      </div>
    </div>
  );
};


