"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MoonStar, RotateCcw, Sparkles } from "lucide-react";
import { TarotCard } from "@/components/tarot-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ALL_CARDS,
  cardKeywords,
  cardMeaning,
  cardName,
  type TarotCardData,
} from "@/lib/cards";
import { useLocale } from "@/lib/i18n";
import { saveReading } from "@/lib/history";
import { drawReading, SPREADS, type DrawnCard, type SpreadId } from "@/lib/tarot";
import { cn } from "@/lib/utils";

type Phase = "idle" | "shuffling" | "revealing";

function ShuffleFan() {
  return (
    <div className="relative mx-auto flex h-56 items-center justify-center">
      {Array.from({ length: 7 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-44 w-28 rounded-xl border border-amber-200/30 bg-gradient-to-br from-indigo-950 via-[#141233] to-violet-950 shadow-xl"
          initial={{ x: 0, rotate: 0, opacity: 0 }}
          animate={{
            x: [0, (i - 3) * 26, (i - 3) * 14, 0],
            rotate: [0, (i - 3) * 7, (i - 3) * -4, 0],
            opacity: [0, 1, 1, 0.9],
          }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          <div className="flex h-full items-center justify-center text-amber-200/70">
            <MoonStar className="h-6 w-6" strokeWidth={1.25} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function ReadingBoard({ spreadId }: { spreadId: SpreadId }) {
  const t = useTranslations("reading");
  const tHome = useTranslations("home");
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [question, setQuestion] = useState("");
  const [drawn, setDrawn] = useState<DrawnCard<TarotCardData>[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);

  const spread = SPREADS[spreadId];
  const flippedCount = useMemo(
    () => flipped.filter(Boolean).length,
    [flipped],
  );

  const deal = () => {
    const reading = drawReading(ALL_CARDS, spreadId);
    setDrawn(reading);
    setFlipped(new Array(reading.length).fill(false));
    saveReading({
      spreadId,
      question: question.trim(),
      locale,
      draws: reading.map((d) => ({
        cardId: d.card.id,
        position_en: d.position.name_en,
        position_vi: d.position.name_vi,
        reversed: d.reversed,
      })),
    });
    if (reduceMotion) {
      setPhase("revealing");
    } else {
      setPhase("shuffling");
      window.setTimeout(() => setPhase("revealing"), 1250);
    }
  };

  const setAll = (v: boolean) => setFlipped((f) => f.map(() => v));
  const toggle = (i: number) =>
    setFlipped((f) => f.map((v, j) => (j === i ? !v : v)));

  return (
    <div className="mx-auto w-full max-w-5xl px-5 pb-24">
      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mx-auto mt-10 max-w-xl text-center"
          >
            <p className="font-display text-3xl text-amber-100 sm:text-4xl">
              {locale === "vi" ? spread.name_vi : spread.name_en}
            </p>
            <label
              htmlFor="question"
              className="mt-8 block text-sm tracking-wide text-white/60 uppercase"
            >
              {tHome("questionLabel")}
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={tHome("questionPlaceholder")}
              rows={3}
              className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-white/5 p-4 text-white placeholder:text-white/30 focus:border-amber-200/60 focus:outline-none"
            />
            <Button
              size="lg"
              onClick={deal}
              className="mt-6 rounded-full bg-amber-300 px-8 text-base font-semibold text-indigo-950 hover:bg-amber-200"
            >
              <Sparkles className="h-5 w-5" />
              {tHome("dealCta")}
            </Button>
          </motion.div>
        )}

        {phase === "shuffling" && (
          <motion.div
            key="shuffling"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 text-center"
          >
            <p className="mb-6 text-sm tracking-[0.25em] text-white/50 uppercase">
              {t("shuffling")}
            </p>
            <ShuffleFan />
          </motion.div>
        )}

        {phase === "revealing" && (
          <motion.div
            key="revealing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <p className="w-full text-center text-sm tracking-wide text-white/50">
                {t("tapToFlip")} · {flippedCount}/{drawn.length}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAll(true)}
                className="rounded-full border-white/20 bg-transparent text-white/80 hover:bg-white/10 hover:text-white"
              >
                {t("flipAll")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAll(false)}
                className="rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                {t("flipBack")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={deal}
                className="rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                {t("newReading")}
              </Button>
            </div>

            <div
              className={cn(
                "mt-8 grid gap-5",
                spreadId === "single" && "mx-auto max-w-56 grid-cols-1",
                spreadId === "three-card" &&
                  "mx-auto max-w-2xl grid-cols-3 gap-3 sm:gap-5",
                spreadId === "celtic-cross" &&
                  "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
              )}
            >
              {drawn.map((d, i) => (
                <motion.div
                  key={`${d.card.id}-${i}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduceMotion ? 0 : 0.15 + i * 0.12 }}
                >
                  <TarotCard
                    image={d.card.image}
                    name={cardName(d.card, locale)}
                    reversed={d.reversed}
                    flipped={flipped[i] ?? false}
                    onFlip={() => toggle(i)}
                    glow={flipped[i] ?? false}
                  />
                  <p className="mt-2 text-center text-xs tracking-wider text-white/50 uppercase">
                    {locale === "vi"
                      ? d.position.name_vi
                      : d.position.name_en}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mx-auto mt-12 max-w-2xl space-y-4">
              <AnimatePresence>
                {drawn.map(
                  (d, i) =>
                    flipped[i] && (
                      <motion.article
                        key={d.card.id}
                        layout
                        initial={
                          reduceMotion ? false : { opacity: 0, y: 20 }
                        }
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs tracking-wider text-amber-200/70 uppercase">
                            {locale === "vi"
                              ? d.position.name_vi
                              : d.position.name_en}
                          </p>
                          <h3 className="font-display w-full text-xl text-amber-50">
                            {cardName(d.card, locale)}
                          </h3>
                          <Badge
                            className={cn(
                              "rounded-full",
                              d.reversed
                                ? "border-violet-300/30 bg-violet-400/15 text-violet-200"
                                : "border-amber-200/30 bg-amber-300/15 text-amber-200",
                            )}
                          >
                            {d.reversed ? t("reversed") : t("upright")}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {cardKeywords(d.card, locale).map((k) => (
                            <span
                              key={k}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/70"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                        <p className="mt-3 leading-relaxed text-white/85">
                          {cardMeaning(d.card, d.reversed, locale)}
                        </p>
                      </motion.article>
                    ),
                )}
              </AnimatePresence>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/"
                className="inline-flex items-center rounded-full px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t("backHome")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
