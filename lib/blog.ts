import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { BlogPostMeta } from "@/types";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const isProd = process.env.NODE_ENV === "production";

function readRaw(slug: string): string | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function toMeta(slug: string, data: Record<string, any>): BlogPostMeta {
  return {
    slug,
    title: data.title ?? "",
    description: data.description ?? "",
    keywords: data.keywords ?? [],
    snippet: data.snippet ?? "",
    cover: data.cover || undefined,
    author: data.author ?? "Bezold",
    publishedAt: data.publishedAt ?? "",
    updatedAt: data.updatedAt ?? data.publishedAt ?? "",
    faq: data.faq ?? [],
    related: data.related ?? [],
    draft: data.draft ?? false,
  };
}

/** Slugs of all published articles (drafts excluded in production). */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .filter((slug) => {
      if (!isProd) return true;
      const raw = readRaw(slug);
      if (!raw) return false;
      return !matter(raw).data.draft;
    });
}

/** All published articles' metadata, newest first. */
export function getAllPostsMeta(): BlogPostMeta[] {
  return getAllSlugs()
    .map((slug) => toMeta(slug, matter(readRaw(slug)!).data))
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

/** A single article's metadata + raw MDX body, or null when missing/draft. */
export function getPostBySlug(
  slug: string,
): { meta: BlogPostMeta; content: string } | null {
  const raw = readRaw(slug);
  if (!raw) return null;
  const { data, content } = matter(raw);
  if (isProd && data.draft) return null;
  return { meta: toMeta(slug, data), content };
}
