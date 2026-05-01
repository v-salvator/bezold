"use client";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
