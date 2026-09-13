import type { Metadata } from "next";
import LaunchBanner from "../../_components/LaunchBanner";
import SiteNav from "../../_components/SiteNav";
import SiteFooter from "../../_components/SiteFooter";
import JsonLd from "../../_components/JsonLd";
import EpHero from "./_components/EpHero";
import EpChecklist from "./_components/EpChecklist";
import EpExposure from "./_components/EpExposure";
import EpQuote from "./_components/EpQuote";
import EpFinalCta from "./_components/EpFinalCta";
import { EDITOR_PICK_CHECKLIST } from "./editorPickChecklist";
import styles from "./page.module.css";

const PAGE_PATH = "/policy/editor-pick";
const PAGE_TITLE = "如何被選為首頁編輯精選？6 項入選條件";
const PAGE_DESCRIPTION =
  "首頁「編輯精選」如何入選？完成 6 項刊登條件——上傳清晰照片、寫清楚標題、完整填寫欄位、留下有效聯絡方式、補充店家優勢並確認案件仍在頂讓中，讓您的頂讓案件獲得更多曝光，也更有機會被編輯選中。";

export const metadata: Metadata = {
  title: "如何被選為編輯精選 — Bezold 頂讓必售",
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "article",
    url: PAGE_PATH,
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
};

export default function EditorPickPolicyPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const pageUrl = `${appUrl}${PAGE_PATH}`;

  // HowTo structured data — lets Google & answer engines (SGE, etc.) surface
  // the 6 steps directly when someone asks how to get onto 編輯精選.
  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: pageUrl,
    totalTime: "PT10M",
    step: EDITOR_PICK_CHECKLIST.map((item, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: item.title,
      text: item.desc,
      url: `${pageUrl}#step-${item.no}`,
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首頁",
        item: `${appUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "編輯精選入選條件",
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={howToJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
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
