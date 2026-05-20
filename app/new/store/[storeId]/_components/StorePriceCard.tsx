import Button from "@/components/refactored/Button";
import type { Store } from "@/types";
import styles from "./StorePriceCard.module.css";

export default function StorePriceCard({ store }: { store: Store }) {
  const { price, userInfo } = store;
  const priceInWan = (price / 10000).toFixed(0);

  return (
    <div className={styles.card}>
      <span className={styles.label}>頂讓金 ASKING</span>
      <div className={styles.price}>
        NT$ {priceInWan}
        <em>萬</em>
      </div>

      <div className={styles.cta}>
        {userInfo?.phone && (
          <a href={`tel:${userInfo.phone}`} className={styles.ctaLink}>
            <Button className={styles.btn}>📞 撥打賣家電話</Button>
          </a>
        )}
        {userInfo?.lineId && (
          <a
            href={`https://line.me/ti/p/~${userInfo.lineId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaLink}
          >
            <Button variant="sage" className={styles.btn}>
              💬 加 LINE 聯繫
            </Button>
          </a>
        )}
        <Button variant="ghost" className={styles.btn}>
          ✉️ 站內留言
        </Button>
        <Button variant="ghost" className={`${styles.btn} ${styles.visit}`}>
          📅 預約現場看店
        </Button>
      </div>

      <div className={styles.trust}>
        <b>必售！安心提示</b>
        本物件由賣家直接刊登，Bezold 不收取仲介費，洽談 / 議價 /
        簽約皆為買賣雙方直接進行。建議現場看過再決定。
      </div>

      <div className={styles.report}>
        資訊有疑慮？ <a>檢舉此物件</a> · <a>聯絡客服</a>
      </div>
    </div>
  );
}
