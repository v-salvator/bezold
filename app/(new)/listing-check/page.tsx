import type { Metadata } from "next";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import { findUsableListingCheck } from "@/firebase/serverUtils/followUp";
import { getImageByPath } from "@/firebase/serverUtils/image";
import { listingSummary } from "@/lib/followUp/listingRows";
import { FOLLOW_UP_ANSWER, type FollowUpAnswer, type Store } from "@/types";
import { followUpAnchor, formatTaipeiDate } from "@/utils/followUp";
import { isDigitalAsset } from "@/utils/store";
import ListingCheck, {
  type ListingCheckStore,
} from "./_components/ListingCheck";
import LinkInvalid from "./_components/LinkInvalid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "刊登狀態確認 — Bezold 頂讓必售",
  robots: { index: false, follow: false },
  // * the URL carries a one-time token — never hand it to another site
  referrer: "no-referrer",
};

// * every visit reads the token fresh — nothing here may be cached
export const dynamic = "force-dynamic";

const parseAnswer = (value: unknown): FollowUpAnswer | null =>
  value === FOLLOW_UP_ANSWER.SOLD || value === FOLLOW_UP_ANSWER.STILL_SELLING
    ? value
    : null;

// * only what the card shows — the raw store carries seller contact
const toCheckStore = async (store: Store): Promise<ListingCheckStore> => {
  // * digital-asset photos are private (admin/owner only)
  const coverPath = isDigitalAsset(store) ? undefined : store.images?.[0];
  const imageUrl = coverPath ? await getImageByPath(coverPath) : null;
  return {
    storeName: store.storeName,
    summary: listingSummary(store),
    listedSince: formatTaipeiDate(followUpAnchor(store)),
    imageUrl: imageUrl && imageUrl !== "no-image" ? imageUrl : null,
  };
};

export default async function ListingCheckPage({
  searchParams,
}: {
  searchParams: { t?: string; answer?: string };
}) {
  // * reading only — opening the link never changes anything
  const check = await findUsableListingCheck(searchParams.t);

  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <main className={styles.wrapper}>
        {check ? (
          <ListingCheck
            token={searchParams.t!}
            initialAnswer={parseAnswer(searchParams.answer)}
            store={await toCheckStore(check.store)}
          />
        ) : (
          <LinkInvalid />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
