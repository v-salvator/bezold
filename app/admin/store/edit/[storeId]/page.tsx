"use client";
import { useEffect, useState, useCallback } from "react";
import { getStoreById, editStoreById } from "@/firebase/clientUtils";
import { Input, Tag, Skeleton, Typography, Button, notification } from "antd";

import type { Store } from "@/types";

interface EditStoreProps {
  params: { storeId: Store["id"] };
}

export default function EditStore({ params }: EditStoreProps) {
  const [store, setStore] = useState<Store | undefined>(undefined);
  const [storeCloned, setStoreCloned] = useState<Store | undefined>(undefined);
  const [api, contextHolder] = notification.useNotification();

  const fetchStore = useCallback(async () => {
    const fetchedStore = await getStoreById(params.storeId);
    setStore(fetchedStore);
  }, [params.storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  useEffect(() => {
    setStoreCloned(store);
  }, [store]);

  const handleUpdateStore = async () => {
    if (storeCloned) {
      await editStoreById(params.storeId, {
        storeName: storeCloned.storeName,
        location: storeCloned.location,
        description: storeCloned.description,
        price: storeCloned.price,
      });
      api.success({
        message: "Successfuly update store",
        description: `Successfuly update store ${store?.storeName}`,
      });
    }
  };

  const handleStoreFieldChange = (
    key: keyof Store,
    value: Store[keyof Store]
  ) => {
    if (storeCloned) {
      setStoreCloned({
        ...storeCloned,
        [key]: value,
      });
    }
  };

  if (!storeCloned) {
    return (
      <div className="p-[16px]">
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className="p-[16px]">
      <Typography.Title level={5}>Store Name</Typography.Title>
      <Input
        defaultValue={storeCloned?.storeName}
        onChange={(e) => handleStoreFieldChange("storeName", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Location</Typography.Title>
      <Input
        defaultValue={storeCloned?.location}
        onChange={(e) => handleStoreFieldChange("location", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Description</Typography.Title>
      <Input
        defaultValue={storeCloned?.description}
        onChange={(e) => handleStoreFieldChange("description", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Price</Typography.Title>
      <Input
        defaultValue={storeCloned?.price}
        onChange={(e) => handleStoreFieldChange("price", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Currency</Typography.Title>
      <Input defaultValue={storeCloned?.currency} disabled></Input>

      <div className="flex justify-end gap-[8px] mt-[16px]">
        <Button type="primary" onClick={handleUpdateStore}>
          Save
        </Button>
        <Button>Cancel</Button>
      </div>
      {contextHolder}
    </div>
  );
}
