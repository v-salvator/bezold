"use client";
import { useEffect, useState, useCallback } from "react";
import {
  getStoreById,
  getUserById,
  editUserById,
} from "@/firebase/clientUtils";
import { Input, Skeleton, Typography, Button, notification } from "antd";
import { useRouter, usePathname } from "next/navigation";

import type { Store, User } from "@/types";

interface EditStoreBossProps {
  params: { storeId: Store["id"] };
}

export default function EditStoreBoss({ params }: EditStoreBossProps) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [userCloned, setUserCloned] = useState<User | undefined>(undefined);
  const [api, contextHolder] = notification.useNotification();
  const router = useRouter();
  const pathName = usePathname();

  const fetchStore = useCallback(async () => {
    const fetchedStore = await getStoreById(params.storeId);
    const fetchedUser = await getUserById(fetchedStore?.user!);
    setUser(fetchedUser);
  }, [params.storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  useEffect(() => {
    setUserCloned(user);
  }, [user]);

  const handleUpdateUser = async () => {
    if (userCloned) {
      await editUserById(userCloned.id, {
        userName: userCloned.userName,
        email: userCloned.email,
        lineId: userCloned.lineId,
        phone: userCloned.phone,
        remark: userCloned.remark,
      });
      api.success({
        message: "Successfuly update user",
        description: `Successfuly update user ${userCloned?.userName}`,
      });
    }
  };

  const handleUserFieldChange = (key: keyof User, value: User[keyof User]) => {
    if (userCloned) {
      setUserCloned({
        ...userCloned,
        [key]: value,
      });
    }
  };

  if (!userCloned) {
    return (
      <div className="p-[16px]">
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className="p-[16px]">
      <Typography.Title level={5}>User Name</Typography.Title>
      <Input
        defaultValue={userCloned?.userName}
        onChange={(e) => handleUserFieldChange("userName", e.target.value)}
      ></Input>
      <Typography.Title level={5}>email</Typography.Title>
      <Input
        defaultValue={userCloned?.email}
        onChange={(e) => handleUserFieldChange("email", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Line Id</Typography.Title>
      <Input
        defaultValue={userCloned?.lineId}
        onChange={(e) => handleUserFieldChange("lineId", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Phone</Typography.Title>
      <Input
        defaultValue={userCloned?.phone}
        onChange={(e) => handleUserFieldChange("phone", e.target.value)}
      ></Input>
      <Typography.Title level={5}>Remark</Typography.Title>
      <Input
        defaultValue={userCloned?.remark}
        onChange={(e) => handleUserFieldChange("remark", e.target.value)}
      ></Input>

      <div className="flex justify-end gap-[8px] mt-[16px]">
        <Button type="primary" onClick={handleUpdateUser}>
          Save
        </Button>
        <Button
          type="primary"
          onClick={() => router.push(pathName.replace("/boss", ""))}
        >
          Back
        </Button>
        <Button onClick={() => router.push("/admin/store/list")}>Cancel</Button>
      </div>
      {contextHolder}
    </div>
  );
}
