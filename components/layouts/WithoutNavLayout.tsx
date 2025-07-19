import type { Metadata } from "next";
import { Footer, Header } from "@/components";

export const metadata: Metadata = {
  title: "Bezold",
  description: "get to startup right now",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header withSearchBar />
      <div className="mt-header">{children}</div>
      <Footer />
    </>
  );
}
