import "./globals.css";
import type { Metadata } from "next";
import { Noto_Sans_Mono, Noto_Sans_TC } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { Provider } from "jotai";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-noto-sans-mono",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
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
      className={`${notoSansMono.variable} ${notoSansTC.variable} font-noto`}
    >
      <body>
        <Provider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  fontFamily:
                    "var(--font-noto-sans-mono), var(--font-noto-sans-tc)",
                  colorPrimary: "#ff4a31",
                },
              }}
            >
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </Provider>
      </body>
    </html>
  );
}
