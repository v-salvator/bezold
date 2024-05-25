import type { Metadata } from "next";
import { Header } from "@/components";

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
      <div className="pt-header h-screen">{children}</div>
    </>
  );
}
