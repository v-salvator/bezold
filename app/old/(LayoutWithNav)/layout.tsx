import { WithNavLayout } from "@/components/layouts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WithNavLayout>{children}</WithNavLayout>;
}
