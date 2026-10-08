"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MoonStar } from "lucide-react";
import { LocaleToggle } from "@/components/locale-toggle";
import { SpreadPicker } from "@/components/spread-picker";

export default function Home() {
  const t = useTranslations("home");
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-5 pt-6 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-amber-200/90">
          <MoonStar className="h-5 w-5" strokeWidth={1.5} />
          <span className="font-display text-lg tracking-wide">Tarot AI</span>
        </div>
        <LocaleToggle />
      </header>

      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mt-14 text-center sm:mt-20"
      >
        <p className="text-xs tracking-[0.3em] text-amber-200/70 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mx-auto mt-4 max-w-2xl text-4xl leading-tight text-amber-50 sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-white/60">
          {t("subtitle")}
        </p>
      </motion.section>

      <div className="mt-12">
        <SpreadPicker />
      </div>
    </main>
  );
}
