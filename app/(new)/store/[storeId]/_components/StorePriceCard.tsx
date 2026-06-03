import { Phone, MessageCircle, Mail, CalendarDays } from "lucide-react";
import Button from "@/components/refactored/Button";
import type { Store } from "@/types";
import styles from "./StorePriceCard.module.css";

export default function StorePriceCard({
  store,
  isExample = false,
}: {
  store: Store;
  isExample?: boolean;
}) {
  const { price, userInfo } = store;
  const exampleTitle = "這是示範頁面，非真實物件";
  const priceInWan = (price / 10000).toFixed(0);

  return (
    <div className={styles.card}>
      <span className={styles.label}>頂讓金 ASKING</span>
      <div className={styles.price}>
        NT$ {priceInWan}
        <em>萬</em>
      </div>

      <div className={styles.cta}>
        {userInfo?.phone &&
          (isExample ? (
            <span title={exampleTitle} className={styles.ctaLink}>
              <Button className={styles.btn} disabled>
                <Phone size={15} strokeWidth={2.5} />
                撥打賣家電話
              </Button>
            </span>
          ) : (
            <a href={`tel:${userInfo.phone}`} className={styles.ctaLink}>
              <Button className={styles.btn}>
                <Phone size={15} strokeWidth={2.5} />
                撥打賣家電話
              </Button>
            </a>
          ))}
        {userInfo?.lineId &&
          (isExample ? (
            <span title={exampleTitle} className={styles.ctaLink}>
              <Button variant="sage" className={styles.btn} disabled>
                <MessageCircle size={15} strokeWidth={2.5} />加 LINE 聯繫
              </Button>
            </span>
          ) : (
            <a
              href={`https://line.me/ti/p/~${userInfo.lineId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaLink}
            >
              <Button variant="sage" className={styles.btn}>
                <MessageCircle size={15} strokeWidth={2.5} />加 LINE 聯繫
              </Button>
            </a>
          ))}
        <span title={isExample ? exampleTitle : undefined}>
          <Button variant="ghost" className={styles.btn} disabled={isExample}>
            <Mail size={15} strokeWidth={2.5} />
            站內留言
          </Button>
        </span>
        <span title={isExample ? exampleTitle : undefined}>
          <Button
            variant="ghost"
            className={`${styles.btn} ${styles.visit}`}
            disabled={isExample}
          >
            <CalendarDays size={15} strokeWidth={2.5} />
            預約現場看店
          </Button>
        </span>
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
