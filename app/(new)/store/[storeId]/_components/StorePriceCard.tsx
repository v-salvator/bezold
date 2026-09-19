import { Ruler, Banknote, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { type Store, STORE_STATUS } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import { EQUIPMENT_LABEL } from "@/constant/storeEquipment";
import { formatPriceDisplay, formatPriceParts } from "@/utils/store";
import { isLatinChar } from "@/utils/string";
import { SellerContactLines, SellerContactCta } from "./SellerContactGate";
import styles from "./StorePriceCard.module.css";

export default function StorePriceCard({
  store,
  isExample = false,
}: {
  store: Store;
  isExample?: boolean;
}) {
  const {
    price,
    priceNegotiable,
    userInfo,
    tags,
    areaPing,
    monthlyRent,
    equipment,
  } = store;
  // * price 0 has no amount/unit split — reuse the shared label (面議 / 免頂讓金).
  const priceLabel =
    price === 0 ? formatPriceDisplay(price, priceNegotiable) : null;
  const { amount: priceAmount, unit: priceUnit } = formatPriceParts(price);
  // * price > 0 + negotiable = 可面議 (de-emphasised marker beside the amount).
  const isNegotiable = price > 0 && !!priceNegotiable;
  // * sold listings hide all seller contact info + CTAs — only the name shows.
  const isSold = store.status === STORE_STATUS.SOLD;
  // * blank on real listings (the server strips it — see omitSellerContact());
  // * SellerContactGate fetches the real values once the viewer is a member.
  const initialContact = {
    phone: userInfo?.phone ?? "",
    lineId: userInfo?.lineId ?? "",
    email: userInfo?.email ?? "",
  };
  const isUrgent = !isSold && tags?.includes(STORE_TAG.EMERGENCY);

  return (
    <div className={styles.card}>
      {userInfo && (
        <div className={styles.seller}>
          <div
            className={cn(
              styles.avatar,
              isLatinChar(userInfo.userName.charAt(0)) && styles.avatarLatin,
            )}
          >
            {userInfo.userName.charAt(0)}
          </div>
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
          {!isSold && (
            <SellerContactLines
              storeId={store.id}
              initialContact={initialContact}
              isExample={isExample}
            />
          )}
        </div>
      )}

      {(areaPing || monthlyRent || equipment) && (
        <dl className={styles.specs}>
          {areaPing && (
            <div className={styles.specItem}>
              <dd>
                <Ruler size={14} strokeWidth={2} className={styles.specIcon} />
                {areaPing} 坪
              </dd>
              <dt>坪數</dt>
            </div>
          )}
          {monthlyRent && (
            <div className={styles.specItem}>
              <dd>
                <Banknote
                  size={14}
                  strokeWidth={2}
                  className={styles.specIcon}
                />
                NT$ {monthlyRent.toLocaleString()}
                <span className={styles.specUnit}>/月</span>
              </dd>
              <dt>租金</dt>
            </div>
          )}
          {equipment && (
            <div className={styles.specItem}>
              <dd>
                <Package
                  size={14}
                  strokeWidth={2}
                  className={styles.specIcon}
                />
                {EQUIPMENT_LABEL[equipment]}
              </dd>
              <dt>設備</dt>
            </div>
          )}
        </dl>
      )}

      <div className={isSold ? styles.priceRowSold : undefined}>
        <div>
          <span className={styles.label}>頂讓金 ASKING</span>
          <div className={styles.price}>
            {priceLabel ?? (
              <>
                {priceAmount}
                <em>{priceUnit}</em>
                {isNegotiable && (
                  <span className={styles.negotiable}>（可面議）</span>
                )}
              </>
            )}
          </div>
        </div>
        {isSold && (
          <div className={styles.soldNotice}>此物件已頂讓，不再開放聯繫</div>
        )}
      </div>

      {!isSold && (
        <SellerContactCta
          storeId={store.id}
          initialContact={initialContact}
          isExample={isExample}
        />
      )}

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
