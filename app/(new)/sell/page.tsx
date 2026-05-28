import type { Metadata } from "next";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import SellForm from "./_components/SellForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bezold 頂讓必售 — 限時免費刊登",
  description: "在 Bezold 頂讓必售 免費刊登您的頂讓店面，快速找到合適買家。",
};

export default function SellPage() {
  return (
    <>
      <SiteNav activeLink="我要頂出" />
      <main className={styles.main}>
        <h1 className={styles.heading}>
          限時<strong>免費刊登</strong>
        </h1>
        <p className={styles.subheading}>
          填寫以下資料，審核後即可上架。完全免費，沒有中間人。
        </p>
        <SellForm />
      </main>
      <SiteFooter />
    </>
  );
}
