"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Check, Copy, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getCardById } from "@/lib/cards";
import { useLocale } from "@/lib/i18n";
import {
  clearHistory,
  deleteReading,
  loadHistory,
  readingToText,
  type SavedReading,
} from "@/lib/history";
import { SPREADS } from "@/lib/tarot";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export default function HistoryPage() {
  const t = useTranslations("history");
  const { locale } = useLocale();
  const readings = useSyncExternalStore(subscribe, loadHistory, () => []);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [, bump] = useState(0);

  const refresh = useCallback(() => bump((n) => n + 1), []);

  const copy = useCallback(
    async (r: SavedReading) => {
      const spread = SPREADS[r.spreadId];
      const text = readingToText(
        r,
        (id) => {
          const c = getCardById(id);
          return locale === "vi" ? c.name_vi : c.name_en;
        },
        locale === "vi" ? spread.name_vi : spread.name_en,
        {
          upright: locale === "vi" ? "Xuôi" : "Upright",
          reversed: locale === "vi" ? "Ngược" : "Reversed",
        },
      );
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      setCopiedId(r.id);
      window.setTimeout(() => setCopiedId((id) => (id === r.id ? null : id)), 2000);
    },
    [locale],
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 pt-6 pb-24">
      <SiteHeader />

      <section className="mt-10 text-center">
        <h1 className="font-display text-3xl text-amber-50 sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-white/55">{t("subtitle")}</p>
      </section>

      {readings.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-white/60">{t("empty")}</p>
          <Button
            className="mt-5 rounded-full bg-amber-300 font-semibold text-indigo-950 hover:bg-amber-200"
          >
            <Link href="/">{t("dealFirst")}</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                clearHistory();
                refresh();
              }}
              className="text-sm text-white/40 hover:text-white/80"
            >
              {t("clearAll")}
            </button>
          </div>
          <div className="space-y-4">
            {readings.map((r) => {
              const spread = SPREADS[r.spreadId];
              return (
                <article
                  key={r.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h2 className="font-display text-lg text-amber-50">
                      {locale === "vi" ? spread.name_vi : spread.name_en}
                    </h2>
                    <time className="text-xs text-white/40">
                      {new Date(r.createdAt).toLocaleString(
                        locale === "vi" ? "vi-VN" : "en-US",
                      )}
                    </time>
                  </div>
                  {r.question && (
                    <p className="mt-1 text-sm text-white/60 italic">
                      ❝ {r.question} ❞
                    </p>
                  )}
                  <ul className="mt-3 space-y-1 text-sm text-white/80">
                    {r.draws.map((d, i) => (
                      <li key={i}>
                        {i + 1}.{" "}
                        {locale === "vi" ? d.position_vi : d.position_en} —{" "}
                        {(() => {
                          const c = getCardById(d.cardId);
                          return locale === "vi" ? c.name_vi : c.name_en;
                        })()}{" "}
                        <span className="text-white/50">
                          ({d.reversed
                            ? locale === "vi"
                              ? "Ngược"
                              : "Reversed"
                            : locale === "vi"
                              ? "Xuôi"
                              : "Upright"})
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(r)}
                      className="rounded-full border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      {copiedId === r.id ? (
                        <>
                          <Check className="h-4 w-4" /> {t("copied")}
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" /> {t("copy")}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        deleteReading(r.id);
                        refresh();
                      }}
                      className="rounded-full text-white/50 hover:bg-white/10 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" /> {t("delete")}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-white/35">
            {readings.length} {t("cardsSuffix") === "lá" ? "quẻ đã lưu" : "saved readings"}
          </p>
        </div>
      )}
    </main>
  );
}
