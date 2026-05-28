import type { Metadata } from "next";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import MyListingsContent from "./_components/MyListingsContent";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bezold 頂讓必售 — 我的刊登",
  description: "查看你在 Bezold 頂讓必售 提交的頂讓店面與審核狀態。",
};

export default function MyListingsPage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>我的刊登</h1>
          <p className={styles.subtitle}>查看你提交的店面與審核狀態</p>
        </div>
        <MyListingsContent />
      </main>
      <SiteFooter />
    </>
  );
}
