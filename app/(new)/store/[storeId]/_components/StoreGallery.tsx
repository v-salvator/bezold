import Image from "next/image";
import type { StoreTag } from "@/types";
import { STORE_TAG } from "@/types/StoreTags";
import styles from "./StoreGallery.module.css";

interface StoreGalleryProps {
  images: string[];
  tags?: StoreTag[];
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className={styles.placeholder}>
      <span>{label}</span>
    </div>
  );
}

export default function StoreGallery({ images, tags }: StoreGalleryProps) {
  const isUrgent = tags?.includes(STORE_TAG.EMERGENCY);
  const slots = Array.from({ length: 5 }, (_, index) => images[index] ?? null);
  const totalImages = images.length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {/* Hero — spans both rows */}
        <div className={styles.hero}>
          {slots[0] ? (
            <Image src={slots[0]} fill alt="店面主圖" className={styles.img} />
          ) : (
            <Placeholder label="店面外觀" />
          )}
          {isUrgent && <span className={styles.ribbon}>急售</span>}
          {totalImages > 0 && (
            <span className={styles.photoCount}>
              📷 查看全部 {totalImages} 張
            </span>
          )}
        </div>

        {/* 4 thumbnails */}
        {[
          { src: slots[1], label: "內裝" },
          { src: slots[2], label: "廚房" },
          { src: slots[3], label: "設備" },
          { src: slots[4], label: "其他" },
        ].map(({ src, label }) => (
          <div key={label} className={styles.thumb}>
            {src ? (
              <Image src={src} fill alt={label} className={styles.img} />
            ) : (
              <Placeholder label={label} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
