"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/firebase/client";
import {
  getUserById,
  editUserById,
  createStoreDoc,
} from "@/firebase/clientUtils";
import StoreImageUpload from "./StoreImageUpload";
import {
  getStoreCities,
  getStoreDistrictByCity,
} from "@/constant/StoreLocation";
import { STORE_TAGS } from "@/constant/storeTags";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { genDefaultStore } from "@/utils/store";
import FormField from "@/components/refactored/FormField";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import { type Store, STORE_STATUS } from "@/types";
import styles from "./SellForm.module.css";

interface StoreFields {
  storeName: string;
  city: string;
  district: string;
  location: string;
  description: string;
  price: string;
  tags: string[];
  category: string;
}

interface BossFields {
  userName: string;
  phone: string;
  email: string;
  lineId: string;
  remark: string;
}

export default function SellForm() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [store, setStore] = useState<StoreFields>({
    ...genDefaultStore(),
    city: "",
    district: "",
    tags: [],
    category: "",
    price: String(genDefaultStore().price),
  });
  const [boss, setBoss] = useState<BossFields>({
    userName: "",
    phone: "",
    email: "",
    lineId: "",
    remark: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdStoreId, setCreatedStoreId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login?redirect=/sell");
        return;
      }
      setAuthUser(firebaseUser);

      const userDoc = await getUserById(firebaseUser.uid);
      setBoss({
        userName: userDoc?.userName ?? "",
        phone: userDoc?.phone ?? "",
        email: firebaseUser.email ?? "",
        lineId: userDoc?.lineId ?? "",
        remark: userDoc?.remark ?? "",
      });

      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  function setStoreField<K extends keyof StoreFields>(
    key: K,
    value: StoreFields[K],
  ) {
    setStore((previous) => ({ ...previous, [key]: value }));
  }

  function setBossField<K extends keyof BossFields>(
    key: K,
    value: BossFields[K],
  ) {
    setBoss((previous) => ({ ...previous, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authUser) return;

    if (!store.storeName || !store.location || !store.description) {
      setError("請填寫店面名稱、地址與描述");
      return;
    }
    if (!boss.userName || !boss.phone) {
      setError("請填寫聯絡人姓名與電話");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await editUserById(authUser.uid, {
        userName: boss.userName,
        phone: boss.phone,
        lineId: boss.lineId,
        remark: boss.remark,
      });
    } catch (err) {
      setError("更新聯絡人資料失敗，請稍後再試");
      setSubmitting(false);
      return;
    }

    try {
      const storeRef = await createStoreDoc({
        ...store,
        price: Number(store.price),
        currency: "TWD",
        user: authUser.uid,
        images: [],
        status: STORE_STATUS.PENDING,
      } as unknown as Store);
      setCreatedStoreId(storeRef.id);
    } catch {
      setError("刊登店面失敗，請稍後再試");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (createdStoreId) {
    return (
      <Card className="w-full max-w-[640px]">
        <StoreImageUpload
          storeId={createdStoreId}
          onDone={() => router.push("/my-listings")}
        />
      </Card>
    );
  }

  const cities = getStoreCities();
  const districts = getStoreDistrictByCity(store.city);

  return (
    <Card className="w-full max-w-[640px]">
      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>店面資料</h2>

          <FormField
            id="storeName"
            label="店面名稱"
            placeholder="例：台北東區手搖飲料店"
            value={store.storeName}
            onChange={(event) => setStoreField("storeName", event.target.value)}
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
                setStoreField("city", event.target.value);
                setStoreField("district", "");
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
              onChange={(event) =>
                setStoreField("district", event.target.value)
              }
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
            onChange={(event) => setStoreField("location", event.target.value)}
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
              onChange={(event) =>
                setStoreField("description", event.target.value)
              }
            />
          </div>

          <FormField
            id="price"
            label="頂讓金（TWD）"
            placeholder="例：500000"
            value={store.price}
            onChange={(event) => setStoreField("price", event.target.value)}
          />

          <div className={styles.field}>
            <label className={styles.label} htmlFor="category">
              類別
            </label>
            <select
              id="category"
              className={styles.select}
              value={store.category}
              onChange={(event) =>
                setStoreField("category", event.target.value)
              }
            >
              <option value="">請選擇類別</option>
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

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
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>聯絡人資料</h2>

          <FormField
            id="userName"
            label="姓名"
            placeholder="請輸入姓名"
            value={boss.userName}
            onChange={(event) => setBossField("userName", event.target.value)}
          />

          <FormField
            id="phone"
            label="電話"
            placeholder="例：0912345678"
            value={boss.phone}
            onChange={(event) => setBossField("phone", event.target.value)}
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
            onChange={(event) => setBossField("lineId", event.target.value)}
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
              onChange={(event) => setBossField("remark", event.target.value)}
            />
          </div>
        </section>

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/store-list")}
          >
            取消
          </Button>
          <Button type="submit" variant="mus" disabled={submitting}>
            {submitting ? "提交中..." : "免費刊登"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
