"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  DEFAULT_FLIP,
  TarotCard,
  type FlipPresetName,
} from "@/components/tarot-card";
import { LocaleToggle } from "@/components/locale-toggle";
import { useLocale } from "@/lib/i18n";
import { getCardById } from "@/lib/cards";
import { cn } from "@/lib/utils";

const ORDER: FlipPresetName[] = ["snappy", "soft", "dramatic"];

const SPECS: Record<FlipPresetName, string> = {
  snappy: "spring 420/32",
  soft: "spring 170/22",
  dramatic: "1.1s ease",
};

export default function PrototypePage() {
  const t = useTranslations("prototype");
  const { locale } = useLocale();
  const [flipped, setFlipped] = useState<Record<FlipPresetName, boolean>>({
    snappy: false,
    soft: false,
    dramatic: false,
  });
  const card = getCardById("major-17");

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-6 pb-24">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Tarot AI
        </Link>
        <LocaleToggle />
      </header>

      <section className="mt-10 text-center">
        <h1 className="font-display text-3xl text-amber-50 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-white/60">{t("subtitle")}</p>
      </section>

      <section className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-3 sm:gap-6">
        {ORDER.map((preset) => (
          <div key={preset} className="text-center">
            <TarotCard
              image={card.image}
              name={locale === "vi" ? card.name_vi : card.name_en}
              reversed={preset === "dramatic"}
              flipped={flipped[preset]}
              onFlip={() =>
                setFlipped((f) => ({ ...f, [preset]: !f[preset] }))
              }
              preset={preset}
              glow={flipped[preset]}
            />
            <p className="mt-3 text-sm text-white/70">{t(preset)}</p>
            {preset === DEFAULT_FLIP && (
              <p
                className={cn(
                  "mt-1 inline-block rounded-full border border-amber-200/30",
                  "bg-amber-300/15 px-2.5 py-0.5 text-[11px] tracking-wider text-amber-200 uppercase",
                )}
              >
                default
              </p>
            )}
            <p className="mt-1 font-mono text-[11px] text-white/60">
              {SPECS[preset]}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
