"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  getStoreById,
  getImagesByPath,
  uploadStoreImageByFile,
  delateStoreImage,
} from "@/firebase/clientUtils";
import { Skeleton, Button, notification } from "antd";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

import type { Store } from "@/types";

interface EditStoreProps {
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
          accept="image/*"
          style={{ visibility: "hidden" }}
          onChange={onImageChange}
        ></input>
      </label>
    </div>
  );
};

export default function EditStore({ params }: EditStoreProps) {
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
  }, []);

  const handleUploadFile = async () => {
    if (file) {
      await uploadStoreImageByFile(store!.id, file);
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
