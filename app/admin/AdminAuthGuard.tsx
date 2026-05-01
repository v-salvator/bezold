"use client";
import { useAdminAuth } from "@/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spin } from "antd";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (pathname === "/admin/login") return;
    if (!isAdmin) router.replace("/admin/login");
  }, [isAdmin, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
