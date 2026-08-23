"use client";

import NextLink from "next/link";
import { trackEvent } from "@/firebase/client";
import styles from "./NewListingButton.module.css";

export default function NewListingButton() {
  return (
    <NextLink
      href="/sell"
      className={styles.button}
      onClick={() =>
        trackEvent("sell_cta_click", { cta_location: "my_listings_header" })
      }
    >
      ＋ 新增刊登
    </NextLink>
  );
}
