"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  getStoreById,
  getImagesByPath,
  uploadStoreImageByFile,
  delateStoreImage,
  uploadVerificationImageByFile,
  deleteVerificationImage,
} from "@/firebase/clientUtils";
import { Skeleton, Button, Divider, Typography, notification } from "antd";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import type { Store } from "@/types";
import {
  IMAGE_UPLOAD_TYPES,
  VERIFICATION_IMAGE_MAX_COUNT,
} from "@/constant/image";
import { isImageUploadLimitError } from "@/utils/image";
import { isDigitalAsset } from "@/utils/store";
import VerificationImageGallery from "../../../_components/VerificationImageGallery";

interface EditStoreImageProps {
  params: { storeId: Store["id"] };
}

const UploadFileAndPreview = ({
  file,
  onClickRemove,
  onImageChange,
}: {
  file: File | undefined;
  onClickRemove: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return file ? (
    <div className="flex gap-[8px]">
      <Image
        src={URL.createObjectURL(file)}
        width={500}
        height={500}
        alt="Picture of the author"
      />
      <Button onClick={onClickRemove}>Remove</Button>
    </div>
  ) : (
    <div className="pt-[8px]">
      <label htmlFor="myFile">
        <Button type="primary" onClick={() => inputRef.current?.click()}>
          Select Image
        </Button>
        <input
          ref={inputRef}
          type="file"
          id="myFile"
          name="filename"
          accept={IMAGE_UPLOAD_TYPES.join(",")}
          style={{ visibility: "hidden" }}
          onChange={onImageChange}
        ></input>
      </label>
    </div>
  );
};

export default function EditStoreImage({ params }: EditStoreImageProps) {
  const [store, setStore] = useState<Store | undefined>(undefined);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | undefined>(undefined);
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();
  const pathName = usePathname();

  const fetchStore = useCallback(async () => {
    const fetchedStore = await getStoreById(params.storeId);
    console.log("🚀 ~ fetchStore ~ fetchedStore:", fetchedStore);
    const imagesUrl = await getImagesByPath(fetchedStore!.images);
    setImages(imagesUrl);
    setStore(fetchedStore);
    setLoading(false);
  }, [params.storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleUploadFile = async () => {
    if (file) {
      try {
        await uploadStoreImageByFile(store!.id, file);
      } catch (uploadError) {
        api.error({
          message: "Upload failed",
          description: isImageUploadLimitError(uploadError)
            ? "Only JPG / PNG / WebP / GIF under 5 MB (after resizing) can be uploaded."
            : `Could not upload image for ${store?.storeName}`,
        });
        return;
      }
      api.success({
        message: "Successfuly upload image",
        description: `Successfuly upload image for ${store?.storeName}`,
      });
      fetchStore();
      setFile(undefined);
    }
  };

  const handleDeleteImage = async (imageIndex: number) => {
    const imagePath = store!.images[imageIndex];
    await delateStoreImage(store!.id, imagePath);
    api.success({
      message: "Successfuly delete image",
      description: `Successfuly deleye image for ${store?.storeName}`,
    });
    fetchStore();
  };

  const handleRemovePreviewImage = () => {
    setFile(undefined);
  };

  return (
    <div className="p-[16px]">
      <div>
        {loading ? (
          <Skeleton.Image active />
        ) : (
          images.map((image, index) => {
            return (
              <div key={index} className="flex gap-[8px] pt-[8px]">
                <Image
                  src={image}
                  width={500}
                  height={500}
                  alt="Picture of the author"
                />
                <Button onClick={() => handleDeleteImage(index)}>Delete</Button>
              </div>
            );
          })
        )}
        <UploadFileAndPreview
          file={file}
          onClickRemove={handleRemovePreviewImage}
          onImageChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
            }
          }}
        ></UploadFileAndPreview>
      </div>
      {store && isDigitalAsset(store) && (
        <VerificationImagesSection
          storeId={store.id}
          paths={store.verificationImages ?? []}
          onChanged={fetchStore}
        />
      )}
      <div className="flex justify-end gap-[8px] mt-[16px]">
        <Button type="primary" onClick={handleUploadFile} disabled={!file}>
          Upload
        </Button>
        <Button
          type="primary"
          onClick={() => router.push(pathName.replace("/image", ""))}
        >
          Back
        </Button>
        <Button
          type="primary"
          onClick={() => window.open(`/store/${store?.id}`, "_blank")}
        >
          View
        </Button>
        <Button onClick={() => router.push("/admin/store/list")}>Cancel</Button>
      </div>
      {contextHolder}
    </div>
  );
}

// * digital assets only — revenue screenshots live in verification/ and
// * verificationImages, apart from the public photos above. Optional for
// * admin-created listings.
function VerificationImagesSection({
  storeId,
  paths,
  onChanged,
}: {
  storeId: Store["id"];
  paths: string[];
  onChanged: () => void;
}) {
  const [api, contextHolder] = notification.useNotification();
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = VERIFICATION_IMAGE_MAX_COUNT - paths.length;

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    // * extra files past the cap are dropped, not rejected wholesale
    const selectedFiles = Array.from(files).slice(0, remaining);
    setUploading(true);
    const failedNames: string[] = [];
    let limitFailure = false;
    // * one at a time — each upload arrayUnions into the same doc
    for (const file of selectedFiles) {
      try {
        await uploadVerificationImageByFile(storeId, file);
      } catch (uploadError) {
        failedNames.push(file.name);
        limitFailure ||= isImageUploadLimitError(uploadError);
      }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (failedNames.length > 0) {
      api.error({
        message: "部分截圖上傳失敗",
        description: limitFailure
          ? "只能上傳 5 MB 以內的 JPG / PNG / WebP / GIF（縮圖後）。"
          : `無法上傳：${failedNames.join("、")}`,
      });
    } else {
      api.success({ message: `已上傳 ${selectedFiles.length} 張核對截圖` });
    }
    onChanged();
  };

  const handleDelete = async (path: string) => {
    setDeletingPath(path);
    try {
      await deleteVerificationImage(storeId, path);
      api.success({ message: "已刪除核對截圖" });
      onChanged();
    } catch {
      api.error({ message: "刪除失敗，請稍後再試" });
    } finally {
      setDeletingPath(null);
    }
  };

  return (
    <div className="pt-[16px]">
      {contextHolder}
      <Divider orientation="left" orientationMargin="0">
        核對截圖（{paths.length}/{VERIFICATION_IMAGE_MAX_COUNT}）
      </Divider>
      <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
        賣家後台的營收／數據截圖，只有管理員和刊登者看得到，不會出現在公開頁面。管理員建立的數位資產可以不上傳。
      </Typography.Paragraph>
      <VerificationImageGallery
        paths={paths}
        onDelete={handleDelete}
        deletingPath={deletingPath}
      />
      <div className="pt-[8px]">
        <Button
          loading={uploading}
          disabled={remaining <= 0}
          onClick={() => inputRef.current?.click()}
        >
          {remaining <= 0
            ? `已達 ${VERIFICATION_IMAGE_MAX_COUNT} 張上限`
            : "上傳核對截圖"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={IMAGE_UPLOAD_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>
    </div>
  );
}
