"use client";

import React from "react";
import styles from "./HeaderHUD.module.css";
import { HudBar } from './HudBar/HudBar'

type Counters = { coins: number; tickets: number; level: number };

export const HeaderHUD: React.FC<{ counters: Counters | null }>
  = ({ counters }) => {
  const coins = Number(counters?.coins ?? 0);
  const tickets = Number(counters?.tickets ?? 0);
  const level = Number(counters?.level ?? 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.topbar}>
        <HudBar label="Level" value={`LVL ${level.toLocaleString(undefined, { minimumIntegerDigits: 1 })}`} iconSrc="/ui/header/Icon_ImageIcon_LevelFrame1.png" tone="purple" />
        <HudBar label="Coins" value={coins.toLocaleString()} iconSrc="/ui/header/ResourceBar_Icon_Gold.png" tone="gold" />
        <HudBar label="Tickets" value={tickets.toLocaleString()} iconSrc="/ui/header/Whisk_Purple_Ticket.png" tone="gold" style={{ ['--icon-size' as unknown as string]: 'clamp(36px, 12cqw, 56px)' }} />
      </div>
    </div>
  );
};


