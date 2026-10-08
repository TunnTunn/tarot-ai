"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Layers, MoonStar, Sparkle } from "lucide-react";
import { SPREADS, type SpreadId } from "@/lib/tarot";
import { useLocale } from "@/lib/i18n";

const ICONS: Record<SpreadId, typeof Sparkle> = {
  single: Sparkle,
  "three-card": Layers,
  "celtic-cross": MoonStar,
};

const ORDER: SpreadId[] = ["single", "three-card", "celtic-cross"];

export function SpreadPicker() {
  const t = useTranslations("spread");
  const { locale } = useLocale();
  return (
    <div>
      <p className="text-center text-sm tracking-[0.25em] text-white/50 uppercase">
        {locale === "vi" ? "Chọn kiểu trải bài" : "Choose a spread"}
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {ORDER.map((id, i) => {
          const Icon = ICONS[id];
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <Link
                href={`/reading/${id}`}
                className="group block rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-amber-200/40 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)]"
              >
                <Icon
                  className="mx-auto h-8 w-8 text-amber-200/80 transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                />
                <p className="font-display mt-4 text-xl text-amber-50">
                  {t(`${id}.name`)}
                </p>
                <p className="mt-1.5 text-sm text-white/55">{t(`${id}.desc`)}</p>
                <p className="mt-2 text-xs tracking-wider text-white/35">
                  {SPREADS[id].positions.length}{" "}
                  {locale === "vi" ? "lá" : "cards"}
                </p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
