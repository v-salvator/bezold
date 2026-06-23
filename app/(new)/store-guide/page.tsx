import type { Metadata } from "next";
import LaunchBanner from "../_components/LaunchBanner";
import SiteNav from "../_components/SiteNav";
import SiteFooter from "../_components/SiteFooter";
import GuideHero from "./_components/GuideHero";
import GlossaryGrid from "./_components/GlossaryGrid";
import BuyerSteps from "./_components/BuyerSteps";
import SellerSteps from "./_components/SellerSteps";
import PitfallsList from "./_components/PitfallsList";
import GuideCta from "./_components/GuideCta";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "頂讓指南 — Bezold 頂讓必售",
  description: "第一次買店或頂出？從名詞解釋到交接流程，一頁看懂頂讓全攻略。",
};

export default function StoreGuidePage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav activeLink="頂讓指南" />
      <div className={styles.frame}>
        <GuideHero />
        <GlossaryGrid />
        <BuyerSteps />
        <SellerSteps />
        <PitfallsList />
        <GuideCta />
      </div>
      <SiteFooter />
    </>
  );
}
