"use client";

import {
  getStoreCities,
  getStoreDistrictByCity,
} from "@/constant/StoreLocation";
import { STORE_TAGS } from "@/constant/storeTags";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { EQUIPMENT_OPTIONS } from "@/constant/storeEquipment";
import { formatPriceDisplay } from "@/utils/store";
import FormField from "@/components/refactored/FormField";
import type { StoreFields, StoreFieldChange } from "./formTypes";
import styles from "./storeForm.module.css";

export default function StoreFieldsSection({
  store,
  onChange,
  showTags = false,
}: {
  store: StoreFields;
  onChange: StoreFieldChange;
  /** Show the read-only, admin-managed 標籤 block (create flow only). */
  showTags?: boolean;
}) {
  const cities = getStoreCities();
  const districts = getStoreDistrictByCity(store.city);

  // * live preview of the buyer-facing 頂讓金 label (invalid input → no preview)
  const priceTrimmed = store.price.trim();
  const previewValue = priceTrimmed ? Number(priceTrimmed) : 0;
  const pricePreview =
    !Number.isNaN(previewValue) && previewValue >= 0
      ? formatPriceDisplay(previewValue, store.priceNegotiable)
      : null;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>店面資料</h2>

      <FormField
        id="storeName"
        label="店面名稱"
        placeholder="例：台北東區手搖飲料店"
        value={store.storeName}
        onChange={(event) => onChange("storeName", event.target.value)}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="city">
          縣市
        </label>
        <select
          id="city"
          className={styles.select}
          value={store.city}
          onChange={(event) => {
            onChange("city", event.target.value);
            onChange("district", "");
          }}
        >
          <option value="">請選擇縣市</option>
          {cities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="district">
          行政區
        </label>
        <select
          id="district"
          className={styles.select}
          value={store.district}
          onChange={(event) => onChange("district", event.target.value)}
          disabled={!store.city}
        >
          <option value="">請選擇行政區</option>
          {districts.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <FormField
        id="location"
        label="詳細地址"
        placeholder="例：忠孝東路四段 123 號"
        value={store.location}
        onChange={(event) => onChange("location", event.target.value)}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="description">
          店面描述
        </label>
        <textarea
          id="description"
          className={styles.textarea}
          placeholder="請描述店面狀況、坪數、月租、頂讓原因等資訊"
          value={store.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <FormField
          id="price"
          label="頂讓金（TWD）"
          placeholder="例：500000"
          value={store.price}
          onChange={(event) => onChange("price", event.target.value)}
        />
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={store.priceNegotiable}
            onChange={(event) =>
              onChange("priceNegotiable", event.target.checked)
            }
          />
          價格可議（買家洽談）
        </label>
        <p className={styles.readonlyNote}>
          留空並勾選可議即為「面議」；填 0 為「免頂讓金」。
          {pricePreview && (
            <>
              {" "}
              買家會看到：<b>{pricePreview}</b>
            </>
          )}
        </p>
      </div>

      <div className={styles.twoCol}>
        <FormField
          id="areaPing"
          label={
            <>
              坪數<span className={styles.optionalBadge}>（選填）</span>
            </>
          }
          placeholder="例：25"
          value={store.areaPing}
          onChange={(event) => onChange("areaPing", event.target.value)}
        />
        <FormField
          id="monthlyRent"
          label={
            <>
              租金（TWD/月）
              <span className={styles.optionalBadge}>（選填）</span>
            </>
          }
          placeholder="例：50000"
          value={store.monthlyRent}
          onChange={(event) => onChange("monthlyRent", event.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="equipment">
          設備狀況
          <span className={styles.optionalBadge}>（選填）</span>
        </label>
        <select
          id="equipment"
          className={styles.select}
          value={store.equipment}
          onChange={(event) => onChange("equipment", event.target.value)}
        >
          <option value="">請選擇設備狀況</option>
          {EQUIPMENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="category">
          類別
        </label>
        <select
          id="category"
          className={styles.select}
          value={store.category}
          onChange={(event) => onChange("category", event.target.value)}
        >
          <option value="">請選擇類別</option>
          {STORE_CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {showTags && (
        <div className={styles.field}>
          <span className={styles.label}>標籤</span>
          <div className={styles.checkboxGroup}>
            {STORE_TAGS.map((tag) => (
              <label
                key={tag.key}
                className={`${styles.checkboxLabel} ${styles.checkboxLabelDisabled}`}
              >
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={false}
                  disabled
                  readOnly
                />
                {tag.label}
              </label>
            ))}
          </div>
          <p className={styles.readonlyNote}>標籤由管理員審核後設定</p>
        </div>
      )}
    </section>
  );
}
