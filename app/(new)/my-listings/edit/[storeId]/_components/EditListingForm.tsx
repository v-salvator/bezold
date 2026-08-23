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
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import StoreFieldsSection from "@/components/storeForm/StoreFieldsSection";
import ContactFieldsSection from "@/components/storeForm/ContactFieldsSection";
import {
  type StoreFields,
  type BossFields,
  emptyBossFields,
  validateStoreForm,
} from "@/components/storeForm/formTypes";
import styles from "@/components/storeForm/storeForm.module.css";
import { type Store, type EquipmentStatus, STORE_STATUS } from "@/types";

export default function EditListingForm({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [store, setStore] = useState<StoreFields | null>(null);
  const [boss, setBoss] = useState<BossFields>(emptyBossFields());
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
        // * independent reads → fetch in parallel to halve the load latency
        const [fetchedStore, userDoc] = await Promise.all([
          getStoreById(storeId),
          getUserById(firebaseUser.uid),
        ]);

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

  return (
    <Card className="w-full max-w-[640px]">
      <form className={styles.form} onSubmit={handleSubmit}>
        <StoreFieldsSection store={store} onChange={setStoreField} />

        <ContactFieldsSection boss={boss} onChange={setBossField} />

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
