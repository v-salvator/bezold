"use client";

import NextLink from "next/link";
import { Rocket } from "lucide-react";
import { trackEvent } from "@/firebase/client";
import { ACCELERATION_STARTING_PRICE } from "@/constant/acceleration";
import styles from "./AccelerationBanner.module.css";

const chips = ["Google 搜尋曝光", "BEZOLD 站內置頂", "社群曝光・成效報告"];

export default function AccelerationBanner() {
  return (
    <div className={styles.banner}>
      <span className={styles.tag}>自費加購</span>

      <span className={styles.icon}>
        <Rocket size={26} />
      </span>

      <div className={styles.body}>
        <h2 className={styles.heading}>刊登後，想更快被買家看見？</h2>
        <p className={styles.sub}>
          <span className={styles.subAccent}>免費刊登不變。</span>
          加購頂讓加速包，主動接觸正在找店的潛在買家。
        </p>
        <ul className={styles.chips}>
          {chips.map((chip) => (
            <li key={chip} className={styles.chip}>
              {chip}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.action}>
        <span className={styles.price}>
          NT${ACCELERATION_STARTING_PRICE}{" "}
          <span className={styles.priceFrom}>起</span>
        </span>
        <NextLink
          href="/acceleration"
          className={styles.cta}
          onClick={() =>
            trackEvent("acceleration_cta_click", { plan: "banner" })
          }
        >
          查看加速方案 →
        </NextLink>
      </div>
    </div>
  );
}
