import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./FeaturedListings.module.css";
import StoreCard from "@/components/refactored/StoreCard";
import { type Store, STORE_STATUS } from "@/types";
import { storeToCard } from "@/utils/store";

type Props = {
  stores: Store[];
  num?: string;
  title?: string;
  sub?: string;
  more?: string;
  moreHref?: string;
};

export default function FeaturedListings({
  stores,
  num = "01",
  title = "編輯精選",
  sub = "— 編輯挑選，含設備、地段佳 —",
  more = "看全部 →",
  moreHref,
}: Props) {
  const approvedStores = stores.filter(
    (store) => store.status === STORE_STATUS.APPROVED,
  );

  if (approvedStores.length === 0) return null;

  return (
    <Section variant="alt">
      <SectionTitle
        num={num}
        title={title}
        sub={sub}
        more={more}
        moreHref={moreHref}
      />
      <div className={styles.listings}>
        {approvedStores.map((store) => (
          <a
            key={store.id}
            href={`/store/${store.id}`}
            className={styles.cardLink}
          >
            <StoreCard card={storeToCard(store)} />
          </a>
        ))}
      </div>
    </Section>
  );
}
