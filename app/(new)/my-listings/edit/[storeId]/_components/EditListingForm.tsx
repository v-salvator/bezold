"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";
import {
  getUserById,
  editUserById,
  getStoreById,
  editStoreById,
  updateStoreStatus,
} from "@/firebase/clientUtils";
import StoreImageUpload from "@/app/(new)/sell/_components/StoreImageUpload";
import {
  getStoreCities,
  getStoreDistrictByCity,
} from "@/constant/StoreLocation";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { EQUIPMENT_OPTIONS } from "@/constant/storeEquipment";
import { formatPriceDisplay } from "@/utils/store";
import FormField from "@/components/refactored/FormField";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import { type Store, type EquipmentStatus, STORE_STATUS } from "@/types";
import styles from "@/app/(new)/sell/_components/SellForm.module.css";

interface StoreFields {
  storeName: string;
  city: string;
  district: string;
  location: string;
  description: string;
  price: string;
  priceNegotiable: boolean;
  category: string;
  areaPing: string;
  monthlyRent: string;
  equipment: string;
}

interface BossFields {
  userName: string;
  phone: string;
  email: string;
  lineId: string;
  remark: string;
}

export default function EditListingForm({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [store, setStore] = useState<StoreFields | null>(null);
  const [boss, setBoss] = useState<BossFields>({
    userName: "",
    phone: "",
    email: "",
    lineId: "",
    remark: "",
  });
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [currentStatus, setCurrentStatus] = useState<Store["status"]>(
    STORE_STATUS.PENDING,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push(`/login?redirect=/my-listings/edit/${storeId}`);
        return;
      }
      setAuthUser(firebaseUser);

      try {
        const fetchedStore = await getStoreById(storeId);

        // * not found, not the owner, or rejected → sellers can't edit here
        if (!fetchedStore) {
          setLoadError("找不到此刊登");
          setLoading(false);
          return;
        }
        if (fetchedStore.user !== firebaseUser.uid) {
          router.push("/my-listings");
          return;
        }
        if (fetchedStore.status === STORE_STATUS.REJECTED) {
          router.push("/my-listings");
          return;
        }

        setStore({
          storeName: fetchedStore.storeName ?? "",
          city: fetchedStore.city ?? "",
          district: fetchedStore.district ?? "",
          location: fetchedStore.location ?? "",
          description: fetchedStore.description ?? "",
          price: fetchedStore.price != null ? String(fetchedStore.price) : "",
          priceNegotiable: !!fetchedStore.priceNegotiable,
          category: fetchedStore.category ?? "",
          areaPing:
            fetchedStore.areaPing != null ? String(fetchedStore.areaPing) : "",
          monthlyRent:
            fetchedStore.monthlyRent != null
              ? String(fetchedStore.monthlyRent)
              : "",
          equipment: fetchedStore.equipment ?? "",
        });
        setExistingImages(fetchedStore.images ?? []);
        setCurrentStatus(fetchedStore.status ?? STORE_STATUS.PENDING);

        const userDoc = await getUserById(firebaseUser.uid);
        setBoss({
          userName: userDoc?.userName ?? "",
          phone: userDoc?.phone ?? "",
          email: firebaseUser.email ?? "",
          lineId: userDoc?.lineId ?? "",
          remark: userDoc?.remark ?? "",
        });

        setLoading(false);
      } catch {
        setLoadError("載入刊登失敗，請稍後再試");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router, storeId]);

  function setStoreField<K extends keyof StoreFields>(
    key: K,
    value: StoreFields[K],
  ) {
    setStore((previous) =>
      previous ? { ...previous, [key]: value } : previous,
    );
  }

  function setBossField<K extends keyof BossFields>(
    key: K,
    value: BossFields[K],
  ) {
    setBoss((previous) => ({ ...previous, [key]: value }));
  }

  // * image add/delete persists immediately → an approved listing must re-enter review
  async function handleImagesChanged() {
    if (currentStatus === STORE_STATUS.APPROVED) {
      await updateStoreStatus(storeId, STORE_STATUS.PENDING);
      setCurrentStatus(STORE_STATUS.PENDING);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authUser || !store) return;

    if (!store.storeName || !store.location || !store.description) {
      setError("請填寫店面名稱、地址與描述");
      return;
    }
    // * empty ≠ zero: an empty field is only allowed when 「價格可議」 is checked
    // * (→ 面議). An explicit 0 is a valid price (免頂讓金).
    const priceTrimmed = store.price.trim();
    if (!priceTrimmed && !store.priceNegotiable) {
      setError("請填寫頂讓金，或勾選「價格可議」");
      return;
    }
    const priceValue = priceTrimmed ? Number(priceTrimmed) : 0;
    if (Number.isNaN(priceValue) || priceValue < 0) {
      setError("頂讓金請填寫有效數字");
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
    } catch {
      setError("更新聯絡人資料失敗，請稍後再試");
      setSubmitting(false);
      return;
    }

    try {
      await editStoreById(storeId, {
        storeName: store.storeName,
        city: store.city,
        district: store.district,
        location: store.location,
        description: store.description,
        price: priceValue,
        priceNegotiable: store.priceNegotiable,
        category: store.category,
        // * mirror admin edit: only write optional fields when present (updateDoc rejects undefined)
        ...(store.areaPing ? { areaPing: Number(store.areaPing) } : {}),
        ...(store.monthlyRent
          ? { monthlyRent: Number(store.monthlyRent) }
          : {}),
        ...(store.equipment
          ? { equipment: store.equipment as EquipmentStatus }
          : {}),
        // * any seller edit sends an approved listing back for re-review
        ...(currentStatus === STORE_STATUS.APPROVED
          ? { status: STORE_STATUS.PENDING }
          : {}),
      });
      trackEvent("store_listing_edit", {
        store_id: storeId,
        category: store.category || "unspecified",
        city: store.city || "unspecified",
      });
      router.push("/my-listings");
    } catch {
      setError("更新店面失敗，請稍後再試");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (loadError || !store) {
    return (
      <Card className="w-full max-w-[640px]">
        <p className={styles.errorMsg}>{loadError ?? "無法載入此刊登"}</p>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="mus"
            onClick={() => router.push("/my-listings")}
          >
            返回我的刊登
          </Button>
        </div>
      </Card>
    );
  }

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

          <div className={styles.field}>
            <FormField
              id="price"
              label="頂讓金（TWD）"
              placeholder="例：500000"
              value={store.price}
              onChange={(event) => setStoreField("price", event.target.value)}
            />
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={store.priceNegotiable}
                onChange={(event) =>
                  setStoreField("priceNegotiable", event.target.checked)
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
              onChange={(event) =>
                setStoreField("areaPing", event.target.value)
              }
            />
            <FormField
              id="monthlyRent"
              label={
                <>
                  租金(TWD/月)
                  <span className={styles.optionalBadge}>（選填）</span>
                </>
              }
              placeholder="例：50000"
              value={store.monthlyRent}
              onChange={(event) =>
                setStoreField("monthlyRent", event.target.value)
              }
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
              onChange={(event) =>
                setStoreField("equipment", event.target.value)
              }
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

        <StoreImageUpload
          storeId={storeId}
          heading="店面照片"
          headingBadge="獨立儲存"
          initialImages={existingImages}
          note="此區為獨立操作：照片一經上傳或刪除即立即生效並重新送審，不需按下方的「儲存變更」。"
          onImagesChanged={handleImagesChanged}
        />

        {error && <p className={styles.errorMsg}>{error}</p>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/my-listings")}
          >
            取消
          </Button>
          <Button type="submit" variant="mus" disabled={submitting}>
            {submitting ? "儲存中..." : "儲存變更"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
