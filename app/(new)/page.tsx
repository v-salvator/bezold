import type { Metadata } from "next";
import styles from "./page.module.css";
import LaunchBanner from "./_components/LaunchBanner";
import SiteNav from "./_components/SiteNav";
import HeroSplit from "./_components/HeroSplit";
import TrustBar from "./_components/TrustBar";
import FeaturedListings from "./_components/FeaturedListings";
import Categories from "./_components/Categories";
import Districts from "./_components/Districts";
import BrowseAll from "./_components/BrowseAll";
import HowItWorks from "./_components/HowItWorks";
import WhyUs from "./_components/WhyUs";
import Stories from "./_components/Stories";
import SellerCta from "./_components/SellerCta";
import SocialBar from "./_components/SocialBar";
import Faq from "./_components/Faq";
import SiteFooter from "./_components/SiteFooter";
import JsonLd from "./_components/JsonLd";
import {
  getHighlightedStores,
  getEmergencyStores,
} from "@/firebase/serverUtils/store";
import { SOCIAL_LINKS } from "@/constant/socials";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Bezold 頂讓必售 — 找一間準備好的店",
  description:
    "全台店面頂讓平台。買家直接接手已有客群、設備、營運的店面；賣家把心血交給合適的人。早鳥前 3 個月免費刊登，永久不抽成。",
};

export default async function NewHomePage() {
  const [highlightedStores, emergencyStores] = await Promise.all([
    getHighlightedStores(),
    getEmergencyStores(),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Bezold 頂讓必售",
          url: process.env.NEXT_PUBLIC_APP_URL,
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/assets/bezold.png`,
          sameAs: Object.values(SOCIAL_LINKS),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Bezold 頂讓必售",
          url: process.env.NEXT_PUBLIC_APP_URL,
        }}
      />
      <LaunchBanner />
      <SiteNav />
      <div className={styles.frame}>
        <HeroSplit />
        {/* <TrustBar /> */}
        <FeaturedListings
          stores={highlightedStores}
          moreHref="/store-list?tag=RECOMMENDED"
        />
        <FeaturedListings
          stores={emergencyStores}
          num="02"
          title="急售特區"
          sub="— 限時出售，把握機會 —"
          more="看全部急售 →"
          moreHref="/store-list?tag=EMERGENCY"
        />
        <Categories />
        <Districts />
        <BrowseAll />
        <HowItWorks />
        <WhyUs />
        {/* <Stories /> */}
        <SellerCta />
        <SocialBar />
        <Faq />
      </div>
      <SiteFooter />
    </>
  );
}
