"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoonStar } from "lucide-react";
import { LocaleToggle } from "@/components/locale-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/library", key: "library" },
  { href: "/history", key: "history" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/" className="flex items-center gap-2 text-amber-200/90">
        <MoonStar className="h-5 w-5" strokeWidth={1.5} />
        <span className="font-display text-lg tracking-wide">Tarot AI</span>
      </Link>
      <nav className="flex items-center gap-1 text-sm">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-3.5 py-1.5 transition-colors",
              pathname === l.href
                ? "bg-white/10 text-amber-100"
                : "text-white/55 hover:bg-white/5 hover:text-white",
            )}
          >
            {t(l.key)}
          </Link>
        ))}
      </nav>
      <LocaleToggle />
    </header>
  );
}
