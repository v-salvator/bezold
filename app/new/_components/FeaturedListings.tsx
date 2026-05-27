import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./FeaturedListings.module.css";
import StoreCard from "@/components/refactored/StoreCard";
import { type Store, STORE_STATUS } from "@/types";
import { storeToCard } from "@/utils/store";

export default function FeaturedListings({ stores }: { stores: Store[] }) {
  const approvedStores = stores.filter(
    (store) => store.status === STORE_STATUS.APPROVED,
  );

  if (approvedStores.length === 0) return null;

  return (
    <Section variant="alt">
      <SectionTitle
        num="04"
        title="本週精選 / 急售"
        sub="— 編輯挑選，含設備、地段佳 —"
        more="看全部 →"
      />
      <div className={styles.listings}>
        {approvedStores.map((store) => (
          <a
            key={store.id}
            href={`/new/store/${store.id}`}
            className={styles.cardLink}
          >
            <StoreCard card={storeToCard(store)} />
          </a>
        ))}
      </div>
    </Section>
  );
}
