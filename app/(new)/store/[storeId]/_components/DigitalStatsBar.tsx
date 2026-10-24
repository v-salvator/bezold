import { Banknote, Clock, TrendingUp } from "lucide-react";
import type { Store } from "@/types";
import { REVENUE_DISCLAIMER } from "@/constant/digitalAsset";
import { formatPrice, formatPriceRange } from "@/utils/store";
import styles from "./DigitalStatsBar.module.css";

// * digital assets have no area / rent / equipment — this strip carries the
// * numbers buyers compare instead. Missing values read "—".
export default function DigitalStatsBar({ store }: { store: Store }) {
  const { operatingYears, monthlyRevenue, price, priceMax, priceNegotiable } =
    store;

  return (
    <dl className={styles.bar}>
      <div className={styles.item}>
        <dd>
          <Clock size={16} strokeWidth={2} className={styles.icon} />
          {operatingYears != null ? `${operatingYears} 年` : "—"}
        </dd>
        <dt>經營時間</dt>
      </div>
      <div className={styles.item}>
        <dd>
          <TrendingUp size={16} strokeWidth={2} className={styles.icon} />
          {monthlyRevenue != null ? formatPrice(monthlyRevenue) : "—"}
        </dd>
        <dt>平均月營收</dt>
        {monthlyRevenue != null && (
          <small className={styles.note}>{REVENUE_DISCLAIMER}</small>
        )}
      </div>
      <div className={styles.item}>
        <dd>
          <Banknote size={16} strokeWidth={2} className={styles.icon} />
          {formatPriceRange(price, priceMax, priceNegotiable)}
        </dd>
        <dt>頂讓金額</dt>
      </div>
    </dl>
  );
}
