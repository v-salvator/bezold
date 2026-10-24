import dayjs from "dayjs";
import { Globe, MapPin } from "lucide-react";
import Pill from "@/components/refactored/Pill";
import type { Store } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import { DIGITAL_ASSET_TYPE_LABEL } from "@/constant/digitalAsset";
import { isDigitalAsset } from "@/utils/store";
import styles from "./StoreTitleRow.module.css";

const TAG_VARIANT = {
  [STORE_TAG.EMERGENCY]: "warm",
  [STORE_TAG.RECOMMENDED]: "sage",
  [STORE_TAG.CHEAP]: "mus",
  [STORE_TAG.DETAILED_DATA]: "solid",
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
    digitalTypes,
  } = store;
  const isDigital = isDigitalAsset(store);

  return (
    <div className={styles.row}>
      <div>
        <div className={styles.tags}>
          {tags?.map((tag) => (
            <Pill key={tag} variant={TAG_VARIANT[tag]}>
              {tag === STORE_TAG.EMERGENCY && "急售"}
              {tag === STORE_TAG.RECOMMENDED && "推薦"}
              {tag === STORE_TAG.CHEAP && "優惠"}
              {tag === STORE_TAG.DETAILED_DATA && "資料完整"}
            </Pill>
          ))}
          {isDigital ? (
            <>
              {digitalTypes?.map((type) => (
                <Pill key={type}>{DIGITAL_ASSET_TYPE_LABEL[type]}</Pill>
              ))}
              <Pill variant="mus">詳細資料需申請</Pill>
            </>
          ) : (
            category && <Pill>{category}</Pill>
          )}
        </div>
        <h1 className={styles.name}>
          {!isDigital && city && <>{city} · </>}
          <em>{storeName}</em>
        </h1>
        {isDigital ? (
          // * no location — the asset itself is only revealed after matching
          <div className={styles.loc}>
            <Globe size={18} strokeWidth={2.5} className={styles.pin} />
            DIGITAL ASSET
          </div>
        ) : (
          <div className={styles.loc}>
            <MapPin size={18} strokeWidth={2.5} className={styles.pin} />
            {city}
            {district} · {location}
          </div>
        )}
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
