import Link from "next/link";
import type { BlogPostMeta } from "@/types";
import styles from "./BlogCard.module.css";

export default function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      {post.cover ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img className={styles.cover} src={post.cover} alt={post.title} />
      ) : (
        <div className={styles.coverFallback}>Bezold</div>
      )}
      <div className={styles.body}>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.desc}>{post.description}</p>
        <span className={styles.date}>{post.updatedAt}</span>
      </div>
    </Link>
  );
}
