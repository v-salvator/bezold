import type { Metadata } from "next";
import LaunchBanner from "../../_components/LaunchBanner";
import SiteNav from "../../_components/SiteNav";
import SiteFooter from "../../_components/SiteFooter";
import EpHero from "./_components/EpHero";
import EpChecklist from "./_components/EpChecklist";
import EpExposure from "./_components/EpExposure";
import EpQuote from "./_components/EpQuote";
import EpFinalCta from "./_components/EpFinalCta";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "如何被選為編輯精選 — Bezold 頂讓必售",
  description:
    "首頁「編輯精選」如何入選？完成 6 項刊登條件，讓您的頂讓案件獲得更多曝光，也更有機會被編輯選中。",
};

export default function EditorPickPolicyPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className={styles.frame}>
        <EpHero />
        <EpChecklist />
        <EpExposure />
        <EpQuote />
        <EpFinalCta />
      </div>
      <SiteFooter />
    </>
  );
}
