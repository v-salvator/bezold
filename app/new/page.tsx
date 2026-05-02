import type { Metadata } from "next";
import {
  Caveat,
  Kalam,
  Gloria_Hallelujah,
  JetBrains_Mono,
} from "next/font/google";
import styles from "./page.module.css";
import LaunchBanner from "./_components/LaunchBanner";
import SiteNav from "./_components/SiteNav";
import HeroSplit from "./_components/HeroSplit";
import TrustBar from "./_components/TrustBar";
import FeaturedListings from "./_components/FeaturedListings";
import Categories from "./_components/Categories";
import Districts from "./_components/Districts";
import HowItWorks from "./_components/HowItWorks";
import WhyUs from "./_components/WhyUs";
import Stories from "./_components/Stories";
import SellerCta from "./_components/SellerCta";
import Faq from "./_components/Faq";
import SiteFooter from "./_components/SiteFooter";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-kalam",
  display: "swap",
});
const gloria = Gloria_Hallelujah({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-gloria",
  display: "swap",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "頂讓.tw — 找一間準備好的店",
  description:
    "全台店面頂讓平台。買家直接接手已有客群、設備、營運的店面；賣家把心血交給合適的人。早鳥前 3 個月免費刊登，永久不抽成。",
};

export default function NewHomePage() {
  const fontVars = `${caveat.variable} ${kalam.variable} ${gloria.variable} ${jetbrains.variable}`;

  return (
    <div className={`${styles.root} ${fontVars}`}>
      <LaunchBanner />
      <SiteNav />
      <div className={styles.frame}>
        <HeroSplit />
        <TrustBar />
        <FeaturedListings />
        <Categories />
        <Districts />
        <HowItWorks />
        <WhyUs />
        <Stories />
        <SellerCta />
        <Faq />
      </div>
      <SiteFooter />
    </div>
  );
}
