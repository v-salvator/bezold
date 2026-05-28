"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import NextLink from "next/link";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client";
import { type Store, STORE_STATUS } from "@/types";
import { STORE_CATEGORIES } from "@/constant/storeType";
import StatusBadge from "./StatusBadge";
import styles from "./ListingCard.module.css";

function formatDate(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 30) return `${diffDays} 天前`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} 個月前`;
  return `${Math.floor(diffMonths / 12)} 年前`;
}

export default function ListingCard({ store }: { store: Store }) {
  const rawPath = store.images?.[0] ?? null;
  const [coverImage, setCoverImage] = useState<string | null>(
    rawPath?.startsWith("http") ? rawPath : null,
  );

  useEffect(() => {
    if (!rawPath || rawPath.startsWith("http")) return;
    getDownloadURL(ref(storage, rawPath))
      .then(setCoverImage)
      .catch(() => {});
  }, [rawPath]);
  const categoryEntry = STORE_CATEGORIES.find(
    (cat) => cat.key === store.category,
  );
  const categoryLabel = categoryEntry?.label ?? "";
  const location = [store.city, store.district].filter(Boolean).join(" · ");
  const price = `NT$ ${Math.round(store.price / 10000)} 萬`;

  return (
    <div className={styles.card}>
      <div className={styles.thumb}>
        {coverImage ? (
          <Image src={coverImage} fill alt="店面照" className={styles.img} />
        ) : (
          <span className={styles.thumbPlaceholder}>店面照</span>
        )}
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.name}>{store.storeName}</h3>
          <StatusBadge status={store.status ?? STORE_STATUS.PENDING} />
        </div>

        {(location || categoryLabel) && (
          <p className={styles.meta}>
            {[location, categoryLabel].filter(Boolean).join(" · ")}
          </p>
        )}

        <p className={styles.price}>{price}</p>

        <div className={styles.footer}>
          <span className={styles.date}>{formatDate(store.createTime)}</span>
          {store.status === STORE_STATUS.APPROVED && (
            <NextLink
              href={`/new/store/${store.id}`}
              className={styles.viewLink}
            >
              查看刊登 →
            </NextLink>
          )}
        </div>
      </div>
    </div>
  );
}
