import Logo from "./Logo";
import Pill from "@/components/refactored/Pill";
import Link from "@/components/refactored/Link";
import SellButton from "./SellButton";
import { cn } from "@/lib/utils";
import NextLink from "next/link";

const navLinks = [
  { label: "我要找店", href: "/new/store-list" },
  { label: "我要頂出", href: "/new/store-sell" },
  { label: "頂讓指南", href: "/new/store-guide" },
  { label: "成交故事", href: "/new/stories" },
  { label: "常見問題", href: "/new/faq" },
];

export default function SiteNav({ activeLink }: { activeLink?: string }) {
  return (
    <nav
      className={cn(
        "flex items-center justify-between",
        "border-b-[1.5px] border-solid border-[var(--ink)]",
        "px-7 py-3.5",
        "bg-[var(--paper)]",
      )}
    >
      <Logo />
      <ul
        className={cn(
          "text-sm font-[var(--hand)]",
          "hidden sm:flex gap-[22px]",
          "m-0 p-0 ",
          "list-none",
        )}
      >
        {navLinks.map(({ label, href }) => (
          <Link href={href} key={label} active={label === activeLink}>
            {label}
          </Link>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <NextLink href="/new/login" style={{ textDecoration: "none" }}>
          <Pill>登入</Pill>
        </NextLink>
        <SellButton />
      </div>
    </nav>
  );
}
