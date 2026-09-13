"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import type { User as FirebaseUser } from "firebase/auth";
import { auth, trackEvent } from "@/firebase/client";
import {
  getUserById,
  editUserById,
  createStoreDoc,
} from "@/firebase/clientUtils";
import StoreImageUpload from "./StoreImageUpload";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import StoreFieldsSection from "@/components/storeForm/StoreFieldsSection";
import ContactFieldsSection from "@/components/storeForm/ContactFieldsSection";
import {
  type StoreFields,
  type BossFields,
  emptyStoreFields,
  emptyBossFields,
  validateStoreForm,
} from "@/components/storeForm/formTypes";
import styles from "@/components/storeForm/storeForm.module.css";
import { type Store, STORE_STATUS } from "@/types";

export default function SellForm() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [store, setStore] = useState<StoreFields>(emptyStoreFields());
  const [boss, setBoss] = useState<BossFields>(emptyBossFields());

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

    const result = validateStoreForm(store, boss);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const { priceValue } = result;

    setError(null);
    setSubmitting(true);

    try {
      await editUserById(authUser.uid, {
        userName: boss.userName,
        phone: boss.phone,
        email: boss.email,
        lineId: boss.lineId,
        remark: boss.remark,
      });
    } catch (err) {
      console.error("????????", err);
      setError("更新聯絡人資料失敗，請稍後再試");
      setSubmitting(false);
      return;
    }

    try {
      const storePayload = {
        ...store,
        tags: [],
        price: priceValue,
        currency: "TWD",
        user: authUser.uid,
        images: [],
        status: STORE_STATUS.PENDING,
        ...(store.areaPing ? { areaPing: Number(store.areaPing) } : {}),
        ...(store.monthlyRent
          ? { monthlyRent: Number(store.monthlyRent) }
          : {}),
        ...(store.equipment ? { equipment: store.equipment } : {}),
      };
      const storeRef = await createStoreDoc(storePayload as unknown as Store);
      trackEvent("store_listing_submit", {
        store_id: storeRef.id,
        category: store.category || "unspecified",
        city: store.city || "unspecified",
      });
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

  return (
    <Card className="w-full max-w-[640px]">
      <form className={styles.form} onSubmit={handleSubmit}>
        <StoreFieldsSection store={store} onChange={setStoreField} showTags />

        <ContactFieldsSection boss={boss} onChange={setBossField} />

        <div className={styles.featuredCallout}>
          <span className={styles.featuredIcon} aria-hidden>
            ✦
          </span>
          <div className={styles.featuredBody}>
            <p className={styles.featuredTitle}>
              想登上首頁 <span className={styles.featuredHl}>「編輯精選」</span>
              ？
            </p>
            <p className={styles.featuredText}>
              上傳至少 5 張清晰照片、完整填寫資料與聯絡方式，即有機會獲選。
            </p>
            <a
              href="/policy/editor-pick"
              className={styles.featuredLink}
              onClick={() =>
                trackEvent("editor_pick_guide_click", {
                  location: "sell_form",
                })
              }
            >
              查看完整入選條件 →
            </a>
          </div>
        </div>

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
