import type { Metadata } from "next";
import LaunchBanner from "../_components/LaunchBanner";
import SiteNav from "../_components/SiteNav";
import SiteFooter from "../_components/SiteFooter";
import HeroPromo from "./_components/HeroPromo";
import PackageGrid from "./_components/PackageGrid";
import BenefitsStrip from "./_components/BenefitsStrip";

export const metadata: Metadata = {
  title: "頂讓加速包 — Bezold 頂讓必售",
  description:
    "刊登後不只是等買家出現。加購頂讓加速包，讓正在 Google 搜尋店面的潛在買家主動看見你的頂讓案件。",
};

export default function AccelerationPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <div className="flex-1">
        <HeroPromo />
        <PackageGrid />
        <BenefitsStrip />
      </div>
      <SiteFooter />
    </>
  );
}
