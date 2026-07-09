import type { Metadata } from "next";
import LaunchBanner from "../_components/LaunchBanner";
import SiteNav from "../_components/SiteNav";
import SiteFooter from "../_components/SiteFooter";
import BlogCard from "./_components/BlogCard";
import { getAllPostsMeta } from "@/lib/blog";
import styles from "./page.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "創業部落格 — Bezold 頂讓必售",
  description:
    "第一次創業、店面頂讓、接手成熟店的完整指南與實戰知識，幫助新手降低創業風險。",
  alternates: { canonical: `${process.env.NEXT_PUBLIC_APP_URL}/blog` },
};

export default function BlogIndexPage() {
  const posts = getAllPostsMeta();

  return (
    <>
      <LaunchBanner />
      <SiteNav activeLink="部落格" />
      <div className="flex-1">
        <div className={styles.frame}>
          <header className={styles.header}>
            <span className={styles.badge}>Blog</span>
            <h1 className={styles.title}>創業部落格</h1>
            <p className={styles.sub}>
              — 從第一次創業到接手成熟店，完整拆解每一步 —
            </p>
          </header>

          {posts.length === 0 ? (
            <p className={styles.empty}>文章即將上線，敬請期待。</p>
          ) : (
            <div className={styles.grid}>
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
