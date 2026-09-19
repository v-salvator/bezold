"use client";

import FormField from "@/components/refactored/FormField";
import type { BossFields, BossFieldChange } from "./formTypes";
import styles from "./storeForm.module.css";

export default function ContactFieldsSection({
  boss,
  onChange,
}: {
  boss: BossFields;
  onChange: BossFieldChange;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>聯絡人資料</h2>

      <FormField
        id="userName"
        label="姓名"
        placeholder="請輸入姓名"
        value={boss.userName}
        onChange={(event) => onChange("userName", event.target.value)}
      />

      <FormField
        id="phone"
        label="電話"
        placeholder="例：0912345678"
        value={boss.phone}
        onChange={(event) => onChange("phone", event.target.value)}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          電子信箱
        </label>
        <input
          id="email"
          type="email"
          className={styles.select}
          value={boss.email}
          readOnly
          style={{ cursor: "default", backgroundImage: "none" }}
        />
        <p className={styles.readonlyNote}>登入帳號的電子信箱，無法修改</p>
      </div>

      <FormField
        id="lineId"
        label="Line ID"
        placeholder="選填"
        value={boss.lineId}
        onChange={(event) => onChange("lineId", event.target.value)}
      />

      <FormField
        id="threadsId"
        label="Threads 帳號"
        placeholder="選填，例：@bezold"
        value={boss.threadsId}
        onChange={(event) => onChange("threadsId", event.target.value)}
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="remark">
          備註
          <span className={styles.optionalBadge}>（選填）</span>
        </label>
        <textarea
          id="remark"
          className={styles.textarea}
          placeholder="其他補充資訊"
          value={boss.remark}
          onChange={(event) => onChange("remark", event.target.value)}
        />
      </div>
    </section>
  );
}
