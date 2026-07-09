import Logo from "./Logo";
import Link from "@/components/refactored/Link";
import SellButton from "./SellButton";
import NavAuthStatus from "./NavAuthStatus";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "我要找店", href: "/store-list" },
  { label: "我要頂出", href: "/sell" },
  { label: "頂讓指南", href: "/store-guide" },
  { label: "部落格", href: "/blog" },
  { label: "常見問題", href: "/faq" },
];

export default function SiteNav({ activeLink }: { activeLink?: string }) {
  return (
    <nav
      className={cn(
        "border-b-[1.5px] border-solid border-[var(--ink)]",
        "px-7 py-3.5",
        "bg-[var(--paper)]",
      )}
    >
      <div className="flex items-center justify-between">
        <Logo />
        <ul
          className={cn(
            "text-sm font-[var(--hand)]",
            "hidden sm:flex gap-[22px]",
            "m-0 p-0",
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
          <NavAuthStatus />
          <SellButton />
        </div>
      </div>

      {/* Mobile-only nav row */}
      <ul
        className={cn(
          "flex sm:hidden justify-around",
          "m-0 p-0 mt-2.5 pt-2.5 list-none",
          "border-t border-dashed border-[var(--ink-2)]",
          "text-sm",
        )}
      >
        {navLinks.map(({ label, href }) => (
          <Link href={href} key={label} active={label === activeLink}>
            {label}
          </Link>
        ))}
      </ul>
    </nav>
  );
}
