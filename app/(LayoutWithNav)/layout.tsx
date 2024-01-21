import "../globals.css";
import { Switcher } from "@/components";
import { cn } from "@/utils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Switcher
        className={cn("bg-primary w-[100%]", "fixed top-header z-10")}
      ></Switcher>
      <div className="pt-header-and-switcher">{children}</div>
    </>
  );
}
