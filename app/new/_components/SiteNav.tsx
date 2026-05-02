import Logo from "./Logo";
import Pill from "@/components/refactored/Pill";
import Button from "@/components/refactored/Button";
import Link from "@/components/refactored/Link";
import { cn } from "@/lib/utils";

const navLinks = ["我要找店", "我要頂出", "頂讓指南", "成交故事", "常見問題"];

export default function SiteNav() {
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
        {navLinks.map((l) => (
          <Link href={`/${l.toLowerCase()}`} key={l}>
            {l}
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
