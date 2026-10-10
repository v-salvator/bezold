import type { Metadata } from "next";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import EmailVerifiedGate from "@/app/(new)/_components/EmailVerifiedGate";
import EditListingForm from "./_components/EditListingForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bezold 頂讓必售 — 編輯刊登",
  description: "編輯你在 Bezold 頂讓必售 刊登的頂讓店面資料。",
};

export default function EditListingPage({
  params,
}: {
  params: { storeId: string };
}) {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <main className={styles.main}>
        <h1 className={styles.heading}>編輯刊登</h1>
        <p className={styles.subheading}>
          修改店面資料後將重新送審，審核通過後更新內容才會公開。
        </p>
        <EmailVerifiedGate
          source="edit_listing_gate"
          redirectPath={`/my-listings/edit/${params.storeId}`}
          title="請先驗證信箱"
          context="驗證完成後就能編輯你的刊登"
        >
          <EditListingForm storeId={params.storeId} />
        </EmailVerifiedGate>
      </main>
      <SiteFooter />
    </>
  );
}
