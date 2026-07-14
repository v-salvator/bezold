import type { Metadata } from "next";
import styles from "./page.module.css";
import LaunchBanner from "./_components/LaunchBanner";
import SiteNav from "./_components/SiteNav";
import HeroSplit from "./_components/HeroSplit";
import Newsletter from "./_components/Newsletter";
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
  title: {
    absolute: "頂讓網｜全台店面頂讓平台 - Bezold 頂讓必售",
  },
  description:
    "頂讓網 Bezold — 全台店面頂讓平台。買家直接接手已有客群、設備、營運的店面；賣家把心血交給合適的人。店面頂讓、生意頂讓真實刊登，早鳥前 3 個月免費刊登，永久不抽成。",
  alternates: {
    canonical: "/",
  },
};

export default async function NewHomePage() {
  const [highlightedStores, emergencyStores] = await Promise.all([
    getHighlightedStores(),
    getEmergencyStores(),
  ]);

  return (
    <>
      {/* Warm the beehiiv connection and start downloading the subscribe-form
          loader during initial HTML parse, so it's cached by the time the
          Newsletter section mounts it — cuts the first-load lag. */}
      <link rel="preconnect" href="https://subscribe-forms.beehiiv.com" />
      <link
        rel="preload"
        as="script"
        href="https://subscribe-forms.beehiiv.com/v3/loader.js"
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Bezold 頂讓必售",
          alternateName: ["頂讓網", "Bezold 頂讓網", "台灣頂讓網"],
          url: process.env.NEXT_PUBLIC_APP_URL,
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/bezold-avatar-v2.png`,
          description:
            "全台店面頂讓平台，提供店面頂讓、生意頂讓真實刊登，買賣雙方直接聯絡。",
          sameAs: Object.values(SOCIAL_LINKS),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Bezold 頂讓必售",
          alternateName: "頂讓網",
          url: process.env.NEXT_PUBLIC_APP_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL}/store-list?city={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <LaunchBanner />
      <SiteNav />
      <div className={styles.frame}>
        <HeroSplit />
        <Newsletter />
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
