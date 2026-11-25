import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import EmailVerifiedGate from "@/app/(new)/_components/EmailVerifiedGate";
import SellForm from "./_components/SellForm";
import SellGuide from "./_components/SellGuide";
import JsonLd from "@/app/(new)/_components/JsonLd";
import { platformFaq, sellerFaq } from "@/app/(new)/faq/_components/faqData";
import { toFaqSchemaItems } from "@/app/(new)/faq/_components/faqItem";
import { faqPageJsonLd } from "@/utils/structuredData";
import { LISTING_TYPE } from "@/types";
import { isDigitalAssetsLaunched } from "@/utils/digitalAsset";
import styles from "./page.module.css";

export const metadata: Metadata = pageMetadata({
  title: "刊登頂讓店面｜頂出店面找接手人，成交不抽成",
  description:
    "想頂出店面？在 Bezold 刊登你的店，買家直接聯絡你，沒有仲介，成交永久不抽成。3 分鐘填完，審核後上架。",
  path: "/sell",
});

export default function SellPage({
  searchParams,
}: {
  searchParams: { type?: string | string[] };
}) {
  // * the homepage / list page 「刊登數位資產」 links land on ?type=digital
  const isDigital = searchParams.type === LISTING_TYPE.DIGITAL;
  const sellPath = isDigital ? "/sell?type=digital" : "/sell";
  // * the listing guide is about physical stores — the digital form has its
  // * own rules inline
  const sellFaq = [...platformFaq, ...sellerFaq];

  return (
    <>
      {!isDigital && <JsonLd data={faqPageJsonLd(toFaqSchemaItems(sellFaq))} />}
      <SiteNav activeLink="我要頂出" />
      <main id="sell-form" className={styles.main}>
        <h1 className={styles.heading}>
          刊登你的店，<strong>找到接手人</strong>
        </h1>
        <p className={styles.subheading}>
          填寫以下資料，審核後即可上架。買家直接聯絡你，沒有中間人。
        </p>
        <EmailVerifiedGate
          source="sell_gate"
          redirectPath={sellPath}
          title="刊登前請先驗證信箱"
          context={
            isDigital
              ? "驗證完成後就能刊登你的數位資產"
              : "驗證完成後就能刊登你的店面"
          }
        >
          <SellForm
            initialListingType={
              isDigital ? LISTING_TYPE.DIGITAL : LISTING_TYPE.PHYSICAL
            }
            digitalAssetsLaunched={isDigitalAssetsLaunched()}
          />
        </EmailVerifiedGate>
      </main>
      {!isDigital && <SellGuide faqItems={sellFaq} />}
      <SiteFooter />
    </>
  );
}
