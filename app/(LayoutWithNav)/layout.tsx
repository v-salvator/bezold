import "../globals.css";
import { Switcher } from "@/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Switcher></Switcher>
      {children}
    </>
  );
}
