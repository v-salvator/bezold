"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  uploadStoreImageByFile,
  delateStoreImage,
  getImageByPath,
} from "@/firebase/clientUtils";
import Button from "@/components/refactored/Button";
import styles from "./StoreImageUpload.module.css";

interface UploadedImage {
  path: string;
  url: string;
}

export default function StoreImageUpload({
  storeId,
  onDone,
}: {
  storeId: string;
  onDone: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 5;
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload() {
    if (!pendingFile) return;
    setUploading(true);
    setError(null);
    try {
      const snapshot = await uploadStoreImageByFile(storeId, pendingFile);
      const url = await getImageByPath(snapshot.metadata.fullPath);
      setUploadedImages((previous) => [
        ...previous,
        { path: snapshot.metadata.fullPath, url },
      ]);
      setPendingFile(null);
    } catch {
      setError("上傳失敗，請稍後再試");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(path: string) {
    setError(null);
    try {
      await delateStoreImage(storeId, path);
      setUploadedImages((previous) =>
        previous.filter((image) => image.path !== path),
      );
    } catch {
      setError("刪除失敗，請稍後再試");
    }
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>
        上傳店面照片
        <span className={styles.imageCount}>
          {uploadedImages.length} / {MAX_IMAGES}
        </span>
      </h2>

      <p className={styles.successNote}>
        店面資料已送出！可上傳照片讓買家更了解您的店面，也可直接略過。
      </p>

      {uploadedImages.length > 0 && (
        <div className={styles.imageGrid}>
          {uploadedImages.map(({ path, url }) => (
            <div key={path} className={styles.imageRow}>
              <Image
                src={url}
                width={120}
                height={90}
                alt="store image"
                className={styles.thumbnail}
              />
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => handleDelete(path)}
              >
                刪除
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.pickerArea}>
        {pendingFile ? (
          <div className={styles.previewRow}>
            <Image
              src={URL.createObjectURL(pendingFile)}
              width={120}
              height={90}
              alt="preview"
              className={styles.previewThumb}
            />
            <span className={styles.previewName}>{pendingFile.name}</span>
          </div>
        ) : null}

        <div className={styles.fileInputWrap}>
          <button
            type="button"
            className={styles.selectBtn}
            disabled={uploadedImages.length >= MAX_IMAGES}
            onClick={() => inputRef.current?.click()}
          >
            {pendingFile ? "重新選擇" : "選擇照片"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(event) => {
              if (event.target.files?.[0]) {
                setPendingFile(event.target.files[0]);
                setError(null);
              }
            }}
          />
          <button
            type="button"
            className={styles.uploadBtn}
            disabled={!pendingFile || uploading}
            onClick={handleUpload}
          >
            {uploading ? "上傳中..." : "上傳"}
          </button>
        </div>
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        <Button variant="mus" onClick={onDone}>
          {uploadedImages.length > 0 ? "完成刊登" : "略過，完成刊登"}
        </Button>
      </div>
    </div>
  );
}
