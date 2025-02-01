import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_Mono, Noto_Sans_TC } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const notoSansMono = Noto_Sans_Mono({
  style: ["normal"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-mono",
});

const notoSansTC = Noto_Sans_TC({
  style: ["normal"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-tc",
});

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
    <html
      lang="en"
      className={`${notoSansMono.variable} ${notoSansTC.variable}`}
    >
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
