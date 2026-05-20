import dayjs from "dayjs";
import Pill from "@/components/refactored/Pill";
import type { Store } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import styles from "./StoreTitleRow.module.css";

const TAG_VARIANT = {
  [STORE_TAG.EMERGENCY]: "warm",
  [STORE_TAG.HOT]: "warm",
  [STORE_TAG.RECOMMENDED]: "sage",
  [STORE_TAG.CHEAP]: "mus",
} as const;

export default function StoreTitleRow({ store }: { store: Store }) {
  const {
    id,
    storeName,
    city,
    district,
    location,
    tags,
    category,
    createTime,
    updateTime,
  } = store;

  return (
    <div className={styles.row}>
      <div>
        <div className={styles.tags}>
          {tags?.map((tag) => (
            <Pill key={tag} variant={TAG_VARIANT[tag]}>
              {tag === STORE_TAG.EMERGENCY && "急售"}
              {tag === STORE_TAG.HOT && "熱門"}
              {tag === STORE_TAG.RECOMMENDED && "推薦"}
              {tag === STORE_TAG.CHEAP && "優惠"}
            </Pill>
          ))}
          {category && <Pill>{category}</Pill>}
        </div>
        <h2 className={styles.name}>
          {city && <>{city} · </>}
          <em>{storeName}</em>
        </h2>
        <div className={styles.loc}>
          📍 {city}
          {district} · {location}
        </div>
      </div>
      <div className={styles.meta}>
        <b>#{id.slice(-5)}</b>
        上架 · {dayjs(createTime).format("YYYY/MM/DD")}
        <br />
        更新 · {dayjs(updateTime).format("YYYY/MM/DD")}
      </div>
    </div>
  );
}
