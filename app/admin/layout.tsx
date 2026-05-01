import type { Metadata } from "next";
import { Header } from "@/components";
import AdminAuthGuard from "./AdminAuthGuard";
import AdminUserBadge from "@/components/AdminUserBadge";

export const metadata: Metadata = {
  title: "Bezold",
  description: "admin panel for Bezold",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header withSearchBar={false} rightSlot={<AdminUserBadge />} />
      <div className="pt-header h-screen">
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </div>
    </>
  );
}
