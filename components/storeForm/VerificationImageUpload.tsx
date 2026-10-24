"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  uploadVerificationImageByFile,
  deleteVerificationImage,
  getImageByPath,
} from "@/firebase/clientUtils";
import {
  IMAGE_UPLOAD_TYPES,
  VERIFICATION_IMAGE_MAX_COUNT,
} from "@/constant/image";
import {
  VERIFICATION_IMAGE_GUIDE,
  VERIFICATION_IMAGE_TITLE,
} from "@/constant/digitalAsset";
import { isImageUploadLimitError } from "@/utils/image";
import styles from "./VerificationImageUpload.module.css";

const UPLOAD_LIMIT_MESSAGE =
  "截圖太大或格式不支援（JPG / PNG / WebP / GIF，縮圖後 5 MB 以內）";

interface UploadedScreenshot {
  path: string;
  url: string;
}

// * revenue / data screenshots for a digital asset — admin and owner only
// * (storage.rules), never on a public page. Shared by the /sell upload step
// * and the /my-listings edit page.
export default function VerificationImageUpload({
  storeId,
  initialImages,
  onImagesChanged,
}: {
  storeId: string;
  /** Existing Storage paths to pre-load as already-uploaded thumbnails. */
  initialImages?: string[];
  /** Called with the new count after any successful upload or delete. */
  onImagesChanged?: (count: number) => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [screenshots, setScreenshots] = useState<UploadedScreenshot[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const remaining = VERIFICATION_IMAGE_MAX_COUNT - screenshots.length;

  // * pre-load existing screenshots (edit flow) into the same grid
  useEffect(() => {
    if (!initialImages || initialImages.length === 0) return;
    let active = true;
    Promise.all(
      initialImages.map(async (path) => ({
        path,
        url: await getImageByPath(path),
      })),
    ).then((resolved) => {
      if (active) setScreenshots(resolved);
    });
    return () => {
      active = false;
    };
  }, [initialImages]);

  // * the upload or delete has already committed; if only the follow-up
  // * (e.g. sending an approved listing back to review) fails, say so
  async function syncAfterChange(count: number, failureMessage: string) {
    try {
      await onImagesChanged?.(count);
    } catch {
      setError(failureMessage);
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    // * extra files past the cap are dropped, not rejected wholesale
    const selectedFiles = Array.from(files).slice(0, remaining);
    setUploading(true);
    setError(null);
    const uploaded: UploadedScreenshot[] = [];
    let failedCount = 0;
    let limitFailure = false;
    // * one at a time — each upload arrayUnions into the same doc
    for (const file of selectedFiles) {
      try {
        const snapshot = await uploadVerificationImageByFile(storeId, file);
        const path = snapshot.metadata.fullPath;
        uploaded.push({ path, url: await getImageByPath(path) });
      } catch (uploadError) {
        failedCount += 1;
        limitFailure ||= isImageUploadLimitError(uploadError);
      }
    }
    if (inputRef.current) inputRef.current.value = "";

    const nextCount = screenshots.length + uploaded.length;
    setScreenshots((previous) => [...previous, ...uploaded]);
    if (failedCount > 0) {
      setError(
        limitFailure
          ? UPLOAD_LIMIT_MESSAGE
          : `${failedCount} 張截圖上傳失敗，請稍後再試`,
      );
    }
    if (uploaded.length > 0) {
      await syncAfterChange(
        nextCount,
        "截圖已上傳，但重新送審狀態更新失敗，請重新整理確認狀態",
      );
    }
    setUploading(false);
  }

  async function handleDelete(path: string) {
    setDeletingPath(path);
    setError(null);
    let deleted = false;
    try {
      await deleteVerificationImage(storeId, path);
      setScreenshots((previous) =>
        previous.filter((screenshot) => screenshot.path !== path),
      );
      deleted = true;
    } catch {
      setError("刪除失敗，請稍後再試");
    }
    if (deleted) {
      await syncAfterChange(
        screenshots.length - 1,
        "截圖已刪除，但重新送審狀態更新失敗，請重新整理確認狀態",
      );
    }
    setDeletingPath(null);
  }

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.heading}>
        {VERIFICATION_IMAGE_TITLE}
        <span className={styles.count}>
          {screenshots.length} / {VERIFICATION_IMAGE_MAX_COUNT}
        </span>
      </h2>

      <ul className={styles.guide}>
        {VERIFICATION_IMAGE_GUIDE.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      {screenshots.length > 0 && (
        <div className={styles.grid}>
          {screenshots.map(({ path, url }) => (
            <div key={path} className={styles.item}>
              {url === "no-image" ? (
                <div className={styles.missing}>無法載入</div>
              ) : (
                <Image
                  src={url}
                  width={120}
                  height={90}
                  alt="核對截圖"
                  className={styles.thumbnail}
                />
              )}
              <button
                type="button"
                className={styles.deleteBtn}
                disabled={deletingPath === path}
                onClick={() => handleDelete(path)}
              >
                {deletingPath === path ? "刪除中..." : "刪除"}
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <button
          type="button"
          className={styles.uploadBtn}
          disabled={uploading || remaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          {uploading
            ? "上傳中..."
            : remaining <= 0
              ? `已達 ${VERIFICATION_IMAGE_MAX_COUNT} 張上限`
              : "選擇截圖上傳"}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={IMAGE_UPLOAD_TYPES.join(",")}
          className={styles.fileInput}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {error && <p className={styles.errorMsg}>{error}</p>}
    </section>
  );
}
