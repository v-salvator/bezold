import NextLink from "next/link";
import Logo from "./Logo";
import styles from "./AuthNav.module.css";
import { cn } from "@/lib/utils";

type AuthNavVariant = "login" | "signup";

const contextLinks: Record<
  AuthNavVariant,
  { prompt: string; label: string; href: string }
> = {
  login: {
    prompt: "還沒有帳號？",
    label: "立即註冊",
    href: "/new/signup",
  },
  signup: {
    prompt: "已有帳號？",
    label: "登入",
    href: "/new/login",
  },
};

export default function AuthNav({ variant }: { variant: AuthNavVariant }) {
  const { prompt, label, href } = contextLinks[variant];

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
      <p className={styles.ctaText}>
        {prompt}
        <NextLink href={href} className={styles.ctaLink}>
          {label}
        </NextLink>
      </p>
    </nav>
  );
}
