import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./FeaturedListings.module.css";
import StoreCard from "@/components/refactored/StoreCard";
import { cn } from "@/lib/utils";
import { type Store, type StoreStatus, STORE_STATUS } from "@/types";
import { storeToCard } from "@/utils/store";

type Props = {
  stores: Store[];
  num?: string;
  title?: string;
  sub?: string;
  subLink?: { label: string; href: string };
  more?: string;
  moreHref?: string;
  /** Which listing status to show; defaults to approved (buyable) listings. */
  status?: StoreStatus;
};

export default function FeaturedListings({
  stores,
  num = "01",
  title = "編輯精選",
  sub = "— 編輯挑選，含設備、地段佳 —",
  subLink,
  more = "看全部 →",
  moreHref,
  status = STORE_STATUS.APPROVED,
}: Props) {
  // * sold listings are shown dimmed with a 已頂讓 ribbon — derived from status
  // * so the two can't drift out of sync at the call site.
  const sold = status === STORE_STATUS.SOLD;
  const visibleStores = stores.filter((store) => store.status === status);

  if (visibleStores.length === 0) return null;

  return (
    <Section variant="alt">
      <SectionTitle
        num={num}
        title={title}
        sub={sub}
        subLink={subLink}
        more={more}
        moreHref={moreHref}
      />
      <div className={styles.listings}>
        {visibleStores.map((store) => {
          const card = storeToCard(store);
          if (sold) card.ribbon = { label: "已頂讓", variant: "sold" };
          return (
            <a
              key={store.id}
              href={`/store/${store.id}`}
              className={cn(styles.cardLink, sold && styles.soldCard)}
            >
              <StoreCard card={card} />
            </a>
          );
        })}
      </div>
    </Section>
  );
}
