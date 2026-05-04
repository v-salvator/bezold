import Logo from "./Logo";
import Pill from "@/components/refactored/Pill";
import Button from "@/components/refactored/Button";
import Link from "@/components/refactored/Link";
import { cn } from "@/lib/utils";

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
        <Pill>登入</Pill>
        <Button variant="mus" className="px-2 py-1 text-xs">
          + 限時免費刊登
        </Button>
      </div>
    </nav>
  );
}
