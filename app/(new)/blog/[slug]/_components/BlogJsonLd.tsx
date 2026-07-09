import JsonLd from "@/app/(new)/_components/JsonLd";
import type { BlogPostMeta } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const SITE_NAME = "Bezold 頂讓必售";

/**
 * Article structured data: BlogPosting + BreadcrumbList.
 * (FAQPage is emitted separately by the <Faq> block inside the article body.)
 */
export default function BlogJsonLd({ meta }: { meta: BlogPostMeta }) {
  const url = `${APP_URL}/blog/${meta.slug}`;
  const image = meta.cover
    ? [`${APP_URL}${meta.cover}`]
    : [`${APP_URL}/bezold-avatar-v2.png`];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: meta.title,
          description: meta.description,
          image,
          datePublished: meta.publishedAt,
          dateModified: meta.updatedAt,
          keywords: meta.keywords.join(", "),
          author: { "@type": "Organization", name: meta.author },
          publisher: {
            "@type": "Organization",
            name: SITE_NAME,
            logo: {
              "@type": "ImageObject",
              url: `${APP_URL}/bezold-avatar-v2.png`,
            },
          },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          url,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "首頁",
              item: `${APP_URL}/`,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "部落格",
              item: `${APP_URL}/blog`,
            },
            { "@type": "ListItem", position: 3, name: meta.title, item: url },
          ],
        }}
      />
    </>
  );
}
