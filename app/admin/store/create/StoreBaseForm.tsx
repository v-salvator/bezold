"use client";
import { useState } from "react";
import { createStoreDoc, createUserDoc } from "@/firebase/clientUtils";
import {
  Input,
  Divider,
  Typography,
  Button,
  notification,
  Checkbox,
  Select,
} from "antd";
import { useRouter, usePathname } from "next/navigation";
import { genDefaultStore } from "@/utils/store";
import { genDefaultUser } from "@/utils/user";

import type { Store, User } from "@/types";
import { STORE_TAGS } from "@/constant/storeTags";
import { STORE_CATEGORIES } from "@/constant/storeType";
import {
  getStoreCities,
  getStoreDistrictByCity,
} from "@/constant/StoreLocation";

export default function StoreBaseForm() {
  const [store, setStore] = useState<Partial<Store>>(genDefaultStore());
  const [user, setUser] = useState<Partial<User>>(genDefaultUser());
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();
  const pathName = usePathname();

  const isValidateStore = () => {
    const allFilled = Object.values(store).every((storeField) => !!storeField);
    return allFilled;
  };
  const isValidateUser = () => {
    const requiredFields = ["userName", "phone"] as (keyof User)[];
    const allFilled = requiredFields.every((userField) => !!user[userField]);
    if (!allFilled) {
      api.error({
        message: "Some field is missing",
        description: `Make sure to fill all required field`,
      });
    }
    return allFilled;
  };

  const handleCreateStore = async () => {
    if (isValidateStore() && isValidateUser()) {
      const userRef = await createUserDoc(user as User);
      const userId = userRef.id;
      const storeRef = await createStoreDoc({
        ...store,
        price: Number(store.price),
        user: userId,
      } as Store);
      const storeId = storeRef.id;
      api.success({
        message: "Successfuly create store",
        description: `Successfuly create store ${store?.storeName}, Now can go to upload image`,
        onClick: () => {
          // * edit image
          router.push(`/admin/store/edit/${storeId}/image`);
        },
        onClose: () => {
          // * edit image
          router.push(`/admin/store/edit/${storeId}/image`);
        },
      });
    }
  };

  const handleStoreFieldChange = (
    key: keyof Store,
    value: Store[keyof Store]
  ) => {
    setStore({
      ...store,
      [key]: value,
    });
  };

  const handleUserFieldChange = (key: keyof User, value: User[keyof User]) => {
    setUser({
      ...user,
      [key]: value,
    });
  };

  return (
    <div className="p-[16px]">
      <Divider orientation="left" orientationMargin="0">
        Store
      </Divider>
      <Typography.Title level={5}>Store Name</Typography.Title>
      <Input
        defaultValue={store?.storeName}
        onChange={(e) => handleStoreFieldChange("storeName", e.target.value)}
      ></Input>
      <Typography.Title level={5}>City</Typography.Title>
      <Select
        defaultValue={store?.city}
        style={{ width: "100%" }}
        onChange={(val) => handleStoreFieldChange("city", val)}
        options={getStoreCities()}
      />
      <Typography.Title level={5}>District</Typography.Title>
      <Select
        defaultValue={store?.district}
        style={{ width: "100%" }}
        onChange={(val) => handleStoreFieldChange("district", val)}
        options={getStoreDistrictByCity(store?.city)}
      />
      <Typography.Title level={5}>Location</Typography.Title>
      <Input
        defaultValue={store?.location}
        onChange={(e) => handleStoreFieldChange("location", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Description</Typography.Title>
      <Input
        defaultValue={store?.description}
        onChange={(e) => handleStoreFieldChange("description", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Price</Typography.Title>
      <Input
        defaultValue={store?.price}
        onChange={(e) => handleStoreFieldChange("price", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Currency</Typography.Title>
      <Input defaultValue={store?.currency} disabled></Input>
      <Typography.Title level={5}>Tags</Typography.Title>
      <Checkbox.Group
        style={{ width: "100%" }}
        defaultValue={store?.tags}
        onChange={(e) => {
          handleStoreFieldChange("tags", e as string[]);
        }}
      >
        {STORE_TAGS.map((tag) => {
          return (
            <Checkbox key={tag.key} value={tag.key}>
              {tag.label}
            </Checkbox>
          );
        })}
      </Checkbox.Group>
      <Typography.Title level={5}>Category</Typography.Title>
      <Select
        defaultValue={store?.category}
        style={{ width: "100%" }}
        onChange={(val) => handleStoreFieldChange("category", val)}
        options={STORE_CATEGORIES.map((category) => {
          return {
            label: category.label,
            value: category.key,
          };
        })}
      />

      <Divider orientation="left" orientationMargin="0">
        Boss
      </Divider>

      <Typography.Title level={5}>User Name</Typography.Title>
      <Input
        defaultValue={user?.userName}
        onChange={(e) => handleUserFieldChange("userName", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Phone</Typography.Title>
      <Input
        defaultValue={user?.phone}
        onChange={(e) => handleUserFieldChange("phone", e.target.value)}
      ></Input>
      <Typography.Title level={5}>email (optional)</Typography.Title>
      <Input
        defaultValue={user?.email}
        onChange={(e) => handleUserFieldChange("email", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Line Id (optional)</Typography.Title>
      <Input
        defaultValue={user?.lineId}
        onChange={(e) => handleUserFieldChange("lineId", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Remark (optional)</Typography.Title>
      <Input
        defaultValue={user?.remark}
        onChange={(e) => handleUserFieldChange("remark", e.target.value)}
      ></Input>

      <div className="flex justify-end gap-[8px] mt-[16px]">
        <Button type="primary" onClick={handleCreateStore}>
          Create
        </Button>
        <Button onClick={() => router.push("/admin/store/list")}>Cancel</Button>
      </div>
      {contextHolder}
    </div>
  );
}
