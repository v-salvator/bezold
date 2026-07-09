"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./Faq.module.css";

export type BlogFaqItem = {
  q: string;
  a: string;
};

/**
 * Accordion FAQ block that also emits FAQPage JSON-LD for rich results / AEO.
 * Answers are plain strings so they can be reused verbatim in the structured data.
 */
export default function Faq({
  items,
  title = "常見問題（FAQ）",
}: {
  items: BlogFaqItem[];
  title?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!items?.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className={styles.wrap}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {title && <h2 className={styles.heading}>{title}</h2>}
      <div className={styles.list}>
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div className={styles.item} key={item.q}>
              <button
                type="button"
                className={cn(styles.question, isOpen && styles.open)}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <span className={styles.plus}>{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <div className={styles.body}>{item.a}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
