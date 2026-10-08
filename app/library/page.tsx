"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import {
  ALL_CARDS,
  cardKeywords,
  cardMeaning,
  cardName,
  type Suit,
  type TarotCardData,
} from "@/lib/cards";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Filter = "all" | "major" | Suit;
const SUITS: Suit[] = ["wands", "cups", "swords", "pentacles"];

const SUIT_LABEL: Record<Suit, { vi: string; en: string }> = {
  wands: { vi: "Gậy", en: "Wands" },
  cups: { vi: "Cốc", en: "Cups" },
  swords: { vi: "Kiếm", en: "Swords" },
  pentacles: { vi: "Tiền", en: "Pentacles" },
};

export default function LibraryPage() {
  const t = useTranslations("library");
  const tReading = useTranslations("reading");
  const { locale } = useLocale();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_CARDS.filter((c) => {
      if (filter === "major" && c.arcana !== "major") return false;
      if (filter !== "all" && filter !== "major" && c.suit !== filter)
        return false;
      if (!q) return true;
      return (
        c.name_vi.toLowerCase().includes(q) ||
        c.name_en.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  const selected: TarotCardData | null = useMemo(
    () => ALL_CARDS.find((c) => c.id === selectedId) ?? null,
    [selectedId],
  );

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-6 pb-24">
      <SiteHeader />

      <section className="mt-10 text-center">
        <h1 className="font-display text-3xl text-amber-50 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-white/55">{t("subtitle")}</p>
      </section>

      <div className="mx-auto mt-8 max-w-2xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-2xl border border-white/15 bg-white/5 p-3.5 text-base text-white placeholder:text-white/50 focus:border-amber-200/60 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {(
            [
              ["all", t("all")],
              ["major", t("major")],
              ...SUITS.map(
                (s) => [s, SUIT_LABEL[s][locale]] as [Filter, string],
              ),
            ] as [Filter, string][]
          ).map(([f, label]) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                filter === f
                  ? "border-amber-200/60 bg-amber-300/15 text-amber-100"
                  : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-white/60">
          {results.length} {t("count")}
        </p>
      </div>

      {selected && (
        <article className="mx-auto mt-6 grid max-w-3xl gap-5 rounded-3xl border border-amber-200/25 bg-white/[0.05] p-5 backdrop-blur sm:grid-cols-[160px_1fr]">
          <div className="relative mx-auto aspect-[3/5] w-full max-w-40 overflow-hidden rounded-xl border border-amber-200/30">
            <Image
              src={selected.image}
              alt={cardName(selected, locale)}
              fill
              sizes="200px"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl text-amber-50">
              {cardName(selected, locale)}
            </h2>
            <p className="mt-0.5 text-sm text-white/50">
              {locale === "vi" ? selected.name_en : selected.name_vi}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {cardKeywords(selected, locale).map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/70"
                >
                  {k}
                </span>
              ))}
            </div>
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              <p className="text-white/85">
                <Badge className="mr-2 rounded-full border-amber-200/30 bg-amber-300/15 text-amber-200">
                  {tReading("upright")}
                </Badge>
                {cardMeaning(selected, false, locale)}
              </p>
              <p className="text-white/85">
                <Badge className="mr-2 rounded-full border-violet-300/30 bg-violet-400/15 text-violet-200">
                  {tReading("reversed")}
                </Badge>
                {cardMeaning(selected, true, locale)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="mt-3 text-sm text-white/50 underline-offset-4 hover:text-white hover:underline"
            >
              ✕
            </button>
          </div>
        </article>
      )}

      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {results.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedId(c.id)}
            aria-pressed={selectedId === c.id}
            className={cn(
              "group overflow-hidden rounded-xl border bg-indigo-950 text-start transition-[transform,box-shadow,border-color] duration-200 ease-out active:scale-[0.96]",
              selectedId === c.id
                ? "border-amber-200/70 shadow-[0_0_25px_-5px_rgba(251,191,36,0.5)]"
                : "border-white/10 hover:-translate-y-0.5 hover:border-amber-200/40",
            )}
          >
            <div className="relative aspect-[3/5] w-full">
              <Image
                src={c.image}
                alt={cardName(c, locale)}
                fill
                sizes="(max-width: 768px) 30vw, 160px"
                className="object-cover"
                loading="lazy"
              />
            </div>
            <p className="truncate px-2 py-1.5 text-center text-xs text-white/75">
              {cardName(c, locale)}
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}
