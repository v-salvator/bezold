"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import NextLink from "next/link";
import { auth } from "@/firebase/client";
import { getStoresByUserId } from "@/firebase/clientUtils";
import type { Store } from "@/types";
import ListingCard from "./ListingCard";
import styles from "./MyListingsContent.module.css";

export default function MyListingsContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login?redirect=/new/my-listings");
        return;
      }
      try {
        const userStores = await getStoresByUserId(user.uid);
        setStores(userStores);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.center}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>你還沒有刊登任何店面</p>
        <NextLink href="/sell" className={styles.emptyLink}>
          立即免費刊登 →
        </NextLink>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {stores.map((store) => (
        <ListingCard key={store.id} store={store} />
      ))}
    </div>
  );
}
