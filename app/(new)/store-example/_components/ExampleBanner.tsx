import styles from "./ExampleBanner.module.css";
import SellCtaLink from "../../_components/SellCtaLink";

export default function ExampleBanner() {
  return (
    <div className={styles.banner}>
      <span>這是示範頁面，非真實物件</span>
      <SellCtaLink ctaLocation="store_example_banner" className={styles.cta}>
        立即免費刊登 →
      </SellCtaLink>
    </div>
  );
}
