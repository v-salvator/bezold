import type { Store } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import { cn } from "@/lib/utils";
import { isLatinChar } from "@/utils/string";
import styles from "./StoreSellerInfo.module.css";

export default function StoreSellerInfo({ store }: { store: Store }) {
  const { userInfo, tags } = store;

  if (!userInfo) return null;

  const { userName, phone } = userInfo;
  const isUrgent = tags?.includes(STORE_TAG.EMERGENCY);

  return (
    <div className={styles.seller}>
      <div className={styles.row}>
        <div
          className={cn(
            styles.avatar,
            isLatinChar(userName.charAt(0)) && styles.avatarLatin,
          )}
        >
          {userName.charAt(0)}
        </div>
        <div>
          <div className={styles.name}>
            {userName}
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
      <div className={styles.meta}>
        聯絡電話 <b>{phone}</b>
        <br />
        回覆速度 <b>平均 2 小時內</b>
        <br />
        活躍時間 <b>09:00 ~ 21:00</b>
      </div>
    </div>
  );
}
