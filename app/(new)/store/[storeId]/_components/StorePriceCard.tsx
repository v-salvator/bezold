import { Phone, MessageCircle } from "lucide-react";
import Button from "@/components/refactored/Button";
import type { Store } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import { EQUIPMENT_LABEL } from "@/constant/storeEquipment";
import { formatPriceParts } from "@/utils/store";
import styles from "./StorePriceCard.module.css";

export default function StorePriceCard({
  store,
  isExample = false,
}: {
  store: Store;
  isExample?: boolean;
}) {
  const { price, userInfo, tags, areaPing, monthlyRent, equipment } = store;
  const exampleTitle = "這是示範頁面，非真實物件";
  const { amount: priceAmount, unit: priceUnit } = formatPriceParts(price);
  const isUrgent = tags?.includes(STORE_TAG.EMERGENCY);

  return (
    <div className={styles.card}>
      {userInfo && (
        <div className={styles.seller}>
          <div className={styles.avatar}>{userInfo.userName.charAt(0)}</div>
          <div>
            <div className={styles.sellerName}>
              {userInfo.userName}
              <small>屋主直接刊登</small>
            </div>
            <div className={styles.badges}>
              <span className={styles.badge}>
                <span className={styles.dot} />
                身份已驗證
              </span>
              {isUrgent && (
                <span className={`${styles.badge} ${styles.warm}`}>
                  <span className={styles.dot} />
                  急售標記
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {(areaPing || monthlyRent || equipment) && (
        <dl className={styles.specs}>
          {areaPing && (
            <div className={styles.specItem}>
              <dt>坪數</dt>
              <dd>{areaPing} 坪</dd>
            </div>
          )}
          {monthlyRent && (
            <div className={styles.specItem}>
              <dt>租金</dt>
              <dd>NT$ {monthlyRent.toLocaleString()} /月</dd>
            </div>
          )}
          {equipment && (
            <div className={styles.specItem}>
              <dt>設備</dt>
              <dd>{EQUIPMENT_LABEL[equipment]}</dd>
            </div>
          )}
        </dl>
      )}

      <span className={styles.label}>頂讓金 ASKING</span>
      <div className={styles.price}>
        {priceAmount}
        <em>{priceUnit}</em>
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
