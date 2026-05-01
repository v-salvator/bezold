"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks";

export default function AdminUserBadge() {
  const { user, isAdmin } = useAdminAuth();
  const router = useRouter();

  if (!isAdmin || !user?.email) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  return (
    <div className="flex items-center gap-[12px]">
      <Typography.Text className="text-sm">{user.email}</Typography.Text>
      <Button size="small" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
