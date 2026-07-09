export interface BlogFaqEntry {
  q: string;
  a: string;
}

export interface BlogRelatedLink {
  label: string;
  href: string;
}

export interface BlogPostMeta {
  /** Filename without extension — the URL segment under /blog */
  slug: string;
  /** H1 + document title */
  title: string;
  /** Meta description */
  description: string;
  /** Target SEO keywords */
  keywords: string[];
  /** Featured-snippet answer (one concise paragraph) */
  snippet: string;
  /** Optional hero image path under /public */
  cover?: string;
  author: string;
  /** ISO date string (YYYY-MM-DD) */
  publishedAt: string;
  /** ISO date string (YYYY-MM-DD) */
  updatedAt: string;
  /** FAQ block (rendered with FAQPage schema). Authored in frontmatter. */
  faq: BlogFaqEntry[];
  /** 延伸閱讀 internal links. Authored in frontmatter. */
  related: BlogRelatedLink[];
  /** Hidden from listing/build in production when true */
  draft: boolean;
}
