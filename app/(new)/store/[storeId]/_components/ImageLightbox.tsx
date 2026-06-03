"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ImageLightbox.module.css";

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}

export default function ImageLightbox({
  images,
  initialIndex,
  open,
  onClose,
}: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  useEffect(() => {
    setCurrent(initialIndex);
  }, [initialIndex]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, prev, next]);

  if (images.length === 0) return null;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content} aria-label="圖片預覽">
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="關閉"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          <span className={styles.counter}>
            {current + 1} / {images.length}
          </span>

          <div className={styles.imageWrap}>
            <Image
              key={current}
              src={images[current]}
              fill
              alt={`圖片 ${current + 1}`}
              className={styles.image}
              sizes="90vw"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                className={`${styles.nav} ${styles.navLeft}`}
                onClick={prev}
                aria-label="上一張"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
              <button
                className={`${styles.nav} ${styles.navRight}`}
                onClick={next}
                aria-label="下一張"
              >
                <ChevronRight size={22} strokeWidth={2.5} />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className={styles.dots}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === current ? styles.dotActive : ""}`}
                  onClick={() => setCurrent(index)}
                  aria-label={`前往第 ${index + 1} 張`}
                />
              ))}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
