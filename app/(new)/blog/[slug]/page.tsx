import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import FeaturedSnippet from "@/components/blog/FeaturedSnippet";
import Faq from "@/components/blog/Faq";
import RelatedReading from "@/components/blog/RelatedReading";
import Cta from "@/components/blog/Cta";
import { mdxComponents } from "@/components/blog/mdxComponents";
import { getAllSlugs, getPostBySlug } from "@/lib/blog";
import BlogJsonLd from "./_components/BlogJsonLd";
import prose from "@/components/blog/prose.module.css";
import styles from "./page.module.css";

export const dynamicParams = false;

interface BlogPostPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/blog/${slug}`;

  if (!post) {
    return {
      title: "Bezold 頂讓必售 — 找不到文章",
      alternates: { canonical: canonicalUrl },
    };
  }

  const { meta } = post;
  return {
    title: `${meta.title} — Bezold 頂讓必售`,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl,
      siteName: "Bezold 頂讓必售",
      type: "article",
      locale: "zh_TW",
      publishedTime: meta.publishedAt,
      modifiedTime: meta.updatedAt,
      images: meta.cover ? [meta.cover] : ["/assets/bezold.png"],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { meta, content } = post;

  return (
    <>
      <BlogJsonLd meta={meta} />
      <LaunchBanner />
      <SiteNav activeLink="部落格" />
      <div className="flex-1">
        <article className={styles.frame}>
          <nav className={styles.breadcrumb} aria-label="breadcrumb">
            <a href="/">首頁</a>
            <span>/</span>
            <a href="/blog">部落格</a>
            <span>/</span>
            <span>{meta.title}</span>
          </nav>

          <header className={styles.header}>
            <h1 className={styles.title}>{meta.title}</h1>
            <div className={styles.metaRow}>
              <span>{meta.author}</span>
              <span>更新於 {meta.updatedAt}</span>
            </div>
          </header>

          {meta.snippet && <FeaturedSnippet>{meta.snippet}</FeaturedSnippet>}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          {meta.cover && (
            <img className={styles.cover} src={meta.cover} alt={meta.title} />
          )}

          <div className={prose.prose}>
            <MDXRemote
              source={content}
              components={mdxComponents}
              options={{
                parseFrontmatter: false,
                mdxOptions: {
                  remarkPlugins: [remarkGfm],
                  rehypePlugins: [rehypeSlug],
                },
              }}
            />
          </div>

          {meta.faq.length > 0 && <Faq items={meta.faq} />}
          <RelatedReading items={meta.related} />
          <Cta />
        </article>
      </div>
      <SiteFooter />
    </>
  );
}
