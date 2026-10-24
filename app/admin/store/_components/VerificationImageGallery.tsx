"use client";
import { useEffect, useState } from "react";
import { Alert, Button as AntButton, Image, Skeleton } from "antd";

import { getImageByPath } from "@/firebase/clientUtils";

interface VerificationImageGalleryProps {
  paths: string[];
  /** Shown under each thumbnail when given (admin image page). */
  onDelete?: (path: string) => void;
  deletingPath?: string | null;
}

// * revenue screenshots are admin/owner-only Storage paths — resolved here in
// * the browser (storage.rules), never on the server. Clicking a thumbnail
// * opens the preview group so admins can zoom and step through them.
export default function VerificationImageGallery({
  paths,
  onDelete,
  deletingPath,
}: VerificationImageGalleryProps) {
  const [urlByPath, setUrlByPath] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const pathsKey = paths.join("|");

  useEffect(() => {
    if (paths.length === 0) return;
    let cancelled = false;
    setLoading(true);
    Promise.all(paths.map((path) => getImageByPath(path))).then((urls) => {
      if (cancelled) return;
      setUrlByPath(
        Object.fromEntries(paths.map((path, index) => [path, urls[index]])),
      );
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // * pathsKey stands in for the array — a new array with the same paths
    // * must not refetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathsKey]);

  if (paths.length === 0) {
    return (
      <Alert
        type="warning"
        showIcon
        message="賣家還沒上傳核對截圖"
        description="審核前請先向賣家索取後台營收或數據截圖。"
      />
    );
  }

  if (loading) return <Skeleton.Image active />;

  return (
    <Image.PreviewGroup>
      <div className="flex flex-wrap gap-[8px]">
        {paths.map((path) => {
          const url = urlByPath[path];
          return (
            <div key={path} className="flex flex-col items-center gap-[4px]">
              {url && url !== "no-image" ? (
                <Image
                  src={url}
                  alt="核對截圖"
                  width={96}
                  height={96}
                  className="rounded-[6px] object-cover"
                />
              ) : (
                <div className="flex h-[96px] w-[96px] items-center justify-center rounded-[6px] bg-black/[0.04] text-[12px] text-black/25">
                  無法載入
                </div>
              )}
              {onDelete && (
                <AntButton
                  size="small"
                  danger
                  loading={deletingPath === path}
                  onClick={() => onDelete(path)}
                >
                  刪除
                </AntButton>
              )}
            </div>
          );
        })}
      </div>
    </Image.PreviewGroup>
  );
}
