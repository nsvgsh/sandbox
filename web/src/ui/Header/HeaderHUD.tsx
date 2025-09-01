"use client";

import React from "react";
import styles from "./HeaderHUD.module.css";

type Counters = { coins: number; tickets: number; level: number };

export const HeaderHUD: React.FC<{ counters: Counters | null }>
  = ({ counters }) => {
  const coins = Number(counters?.coins ?? 0);
  const tickets = Number(counters?.tickets ?? 0);
  const level = Number(counters?.level ?? 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        {/* Level */}
        <div className={styles.barWrap}>
          <div className={styles.resourceBar} style={{
            // Level visual overrides
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            ["--bar-color" as any]: "#103528",
            ["--icon-url" as any]: "url('/dev/ui/header/assets/Icon_ImageIcon_LevelFrame1.png')",
          }}>
            <div className={styles.resourceText}>{`LVL ${level.toLocaleString(undefined, { minimumIntegerDigits: 1 })}`}</div>
            <div className={styles.resourceIcon} aria-hidden="true" />
          </div>
        </div>

        {/* Coins */}
        <div className={styles.barWrap}>
          <div className={styles.resourceBar} style={{
            ["--bar-color" as any]: "#270E0C",
          }}>
            <div className={styles.resourceText}>{coins.toLocaleString()}</div>
            <div className={styles.resourceIcon} aria-hidden="true" />
          </div>
        </div>

        {/* Tickets */}
        <div className={styles.barWrap}>
          <div className={styles.resourceBar} style={{
            ["--bar-color" as any]: "#1c0f30",
            ["--icon-url" as any]: "url('/dev/ui/header/assets/Icon_ImageIcon_Ticket_Golden.png')",
          }}>
            <div className={styles.resourceText}>{tickets.toLocaleString()}</div>
            <div className={styles.resourceIcon} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
};


