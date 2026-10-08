"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className={cn(
        "inline-flex rounded-full border border-white/15 bg-white/5 p-1 text-sm backdrop-blur",
        className,
      )}
      role="group"
      aria-label="Language / Ngôn ngữ"
    >
      {(["vi", "en"] as const).map((l) => (
        <Button
          key={l}
          variant="ghost"
          size="sm"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={cn(
            "rounded-full px-4 font-semibold tracking-wide uppercase",
            locale === l
              ? "bg-amber-300 text-indigo-950 hover:bg-amber-300 hover:text-indigo-950"
              : "text-white/60 hover:bg-white/10 hover:text-white",
          )}
        >
          {l === "vi" ? "Tiếng Việt" : "English"}
        </Button>
      ))}
    </div>
  );
}
