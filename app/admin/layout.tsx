import type { Metadata } from "next";
import { Header } from "@/components";
import AdminAuthGuard from "./AdminAuthGuard";

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
      <Header withSearchBar={false} />
      <div className="pt-header h-screen">
        <AdminAuthGuard>{children}</AdminAuthGuard>
      </div>
    </>
  );
}
