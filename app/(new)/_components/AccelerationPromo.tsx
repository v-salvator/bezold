"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { trackEvent } from "@/firebase/client";
import Section from "./Section";
import TrackedLink from "@/components/refactored/TrackedLink";
import styles from "./AccelerationPromo.module.css";

export default function AccelerationPromo() {
  // Fire once when the section scrolls into view, so the promo's impression
  // count can be paired with its `acceleration_promo_click` rate for a CTR.
  const bandRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          trackEvent("acceleration_promo_view", {
            location: "home_after_hero",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(band);
    return () => observer.disconnect();
  }, []);

  return (
    <Section>
      <div ref={bandRef} className={styles.promo}>
        <div className={styles.copy}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowLead}>FOR SELLERS</span> / 頂讓加速包
          </div>
          <h2 className={styles.headline}>
            買家正在找店，
            <br />
            讓你的店<em className={styles.accent}>被看見</em>。
          </h2>
          <p className={styles.lede}>
            刊登之後，主動觸及正在搜尋店面的潛在買家。
          </p>
          <TrackedLink
            href="/acceleration"
            event="acceleration_promo_click"
            params={{ location: "home_after_hero" }}
            className={styles.link}
          >
            了解頂讓加速包 ↗
          </TrackedLink>
        </div>

        <div className={styles.art}>
          <Image
            src="/acceleration-buyer.png"
            alt="買家在筆電前搜尋並瀏覽店面頂讓案件"
            width={798}
            height={313}
            className={styles.artImg}
          />
        </div>
      </div>
    </Section>
  );
}
