"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { Button, Typography } from "antd";
import { useRouter } from "next/navigation";

export default function AdminUserBadge() {
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEmail(user?.email ?? null);
    });
    return unsubscribe;
  }, []);

  if (!email) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/admin/login");
  };

  return (
    <div className="flex items-center gap-[12px]">
      <Typography.Text className="text-sm">{email}</Typography.Text>
      <Button size="small" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
