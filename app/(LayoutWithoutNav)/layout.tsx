import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Header } from "@/components";
import StyledComponentsRegistry from "@/lib/AntdRegistry";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <Header withSearchBar />
          <div className="mt-header">{children}</div>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
