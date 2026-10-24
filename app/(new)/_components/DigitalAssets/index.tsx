import Section from "../Section";
import SellCtaLink from "../SellCtaLink";
import SectionTitle from "@/components/refactored/SectionTitle";
import Pill from "@/components/refactored/Pill";
import { TRANSFER_RISK_NOTICE } from "@/constant/digitalAsset";
import type { Store } from "@/types";
import { toCard } from "@/utils/store";
import LatestAssets from "./LatestAssets";
import styles from "./DigitalAssets.module.css";

// * always rendered, even with no approved assets — the 04 slot stays put so
// * the section numbers after it never skip
export default function DigitalAssets({ assets }: { assets: Store[] }) {
  const latestAssets = assets.map((store) => ({
    id: store.id,
    digitalTypes: store.digitalTypes,
    card: toCard(store),
  }));

  return (
    <Section variant="alt">
      <SectionTitle
        num="04"
        title="數位資產頂讓"
        badge={<Pill variant="warm">NEW</Pill>}
        sub="— 讓線上的心血，也有下一章 —"
        more="看全部數位資產 →"
        moreHref="/digital-assets"
      />

      {latestAssets.length > 0 ? (
        <LatestAssets assets={latestAssets} />
      ) : (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>數位資產刊登即將上架</p>
          <p className={styles.emptyText}>
            電商賣場、社群、網站、App……線上經營的心血，也能交給下一位接手。
          </p>
        </div>
      )}

      <div className={styles.footer}>
        <SellCtaLink
          ctaLocation="home_digital_assets"
          href="/sell?type=digital"
          className={styles.sellLink}
        >
          我也有數位資產想刊登 ↗
        </SellCtaLink>
        <p className={styles.notice}>{TRANSFER_RISK_NOTICE}</p>
      </div>
    </Section>
  );
}
