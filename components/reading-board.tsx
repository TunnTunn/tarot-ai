"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MoonStar, RotateCcw, Shuffle, Sparkles, Undo2 } from "lucide-react";
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
import {
  applySpread,
  shuffle,
  SPREADS,
  type DrawnCard,
  type SpreadId,
} from "@/lib/tarot";
import { cn } from "@/lib/utils";

type Phase = "idle" | "choose" | "revealing";

export function ReadingBoard({ spreadId }: { spreadId: SpreadId }) {
  const t = useTranslations("reading");
  const tHome = useTranslations("home");
  const { locale } = useLocale();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [question, setQuestion] = useState("");
  const [fan, setFan] = useState<TarotCardData[]>([]);
  const [pickedIds, setPickedIds] = useState<string[]>([]);
  const [drawn, setDrawn] = useState<DrawnCard<TarotCardData>[]>([]);
  const [flipped, setFlipped] = useState<boolean[]>([]);

  const spread = SPREADS[spreadId];
  const need = spread.positions.length;
  const flippedCount = useMemo(
    () => flipped.filter(Boolean).length,
    [flipped],
  );

  const startChoosing = () => {
    setFan(shuffle(ALL_CARDS));
    setPickedIds([]);
    setPhase("choose");
  };

  const remaining = fan.length - pickedIds.length;

  const drawOne = () => {
    if (pickedIds.length >= need) return;
    const nextCard = fan[pickedIds.length];
    if (!nextCard) return;
    const next = [...pickedIds, nextCard.id];
    setPickedIds(next);
    if (next.length === need) {
      window.setTimeout(() => dealWith(next), 550);
    }
  };

  const undoPick = () => setPickedIds((prev) => prev.slice(0, -1));

  const dealWith = (ids: string[]) => {
    const picked = ids
      .map((id) => fan.find((c) => c.id === id))
      .filter((c): c is TarotCardData => c !== undefined);
    if (picked.length !== need) return;
    const reading = applySpread(picked, spreadId);
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
    setPhase("revealing");
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
              className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-white/5 p-4 text-base text-white placeholder:text-white/50 focus:border-amber-200/60 focus:outline-none"
            />
            <Button
              size="lg"
              onClick={startChoosing}
              className="mt-6 rounded-full bg-amber-300 px-8 text-base font-semibold text-indigo-950 transition-transform duration-150 ease-out hover:bg-amber-200 enabled:active:scale-[0.96]"
            >
              <Sparkles className="h-5 w-5" />
              {tHome("pickCta")}
            </Button>
          </motion.div>
        )}

        {phase === "choose" && (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            className="mt-8"
          >
            <div className="text-center">
              <p className="font-display text-2xl text-amber-50">
                {t("chooseTitle")} · {pickedIds.length}/{need}
              </p>
              <p className="mt-1 text-sm text-white/60">{t("chooseHint")}</p>
            </div>

            <div className="mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-[#141233]/90 px-4 py-2 backdrop-blur">
              <span className="text-sm tabular-nums text-amber-100">
                {pickedIds.length}/{need} {t("chosenOf")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={pickedIds.length === 0}
                onClick={undoPick}
                className="rounded-full text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-40"
              >
                <Undo2 className="h-4 w-4" />
                {t("undoPick")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={startChoosing}
                className="rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <Shuffle className="h-4 w-4" />
                {t("reshuffle")}
              </Button>
            </div>

            <div className="mt-10 flex flex-col items-center">
              <button
                type="button"
                onClick={drawOne}
                disabled={pickedIds.length >= need}
                aria-label={t("tapDeck")}
                className="group relative h-56 w-40 transition-transform duration-150 ease-out enabled:active:scale-[0.96] disabled:cursor-default"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden
                    style={{ transform: `translate(${-i * 3}px, ${-i * 3}px)` }}
                    className={cn(
                      "absolute inset-0 rounded-2xl border bg-gradient-to-br from-indigo-950 via-[#141233] to-violet-950",
                      i === 4
                        ? "border-amber-200/50 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.8)] transition-shadow duration-300 group-hover:shadow-[0_24px_70px_-15px_rgba(251,191,36,0.35)]"
                        : "border-amber-200/20",
                    )}
                  />
                ))}
                <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-amber-200/80">
                  <MoonStar className="h-9 w-9" strokeWidth={1.25} />
                  <span className="text-xs tabular-nums tracking-widest">
                    {remaining}
                  </span>
                </span>
              </button>
              <p className="mt-4 text-sm text-white/60">{t("tapDeck")}</p>

              <div className="mt-6 flex min-h-28 flex-wrap items-start justify-center gap-2">
                <AnimatePresence>
                  {pickedIds.map((id, i) => (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: -48, scale: 0.7 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ type: "spring", stiffness: 380, damping: 26 }}
                      className="relative h-20 w-14 rounded-lg border border-amber-300/70 bg-gradient-to-br from-indigo-950 via-[#141233] to-violet-950 shadow-[0_0_18px_-4px_rgba(251,191,36,0.6)]"
                    >
                      <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-[11px] font-bold tabular-nums text-indigo-950">
                        {i + 1}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {pickedIds.length === 0 && (
                  <p className="w-full text-center text-sm text-white/35">
                    —
                  </p>
                )}
              </div>
            </div>
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
              <p className="w-full text-center text-sm tabular-nums tracking-wide text-white/60">
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
                onClick={startChoosing}
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
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: 140,
                          scale: 0.85,
                          rotate: i % 2 === 0 ? -6 : 6,
                        }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  transition={
                    reduceMotion
                      ? { duration: 0.15 }
                      : {
                          type: "spring",
                          stiffness: 210,
                          damping: 21,
                          delay: 0.1 + i * 0.09,
                        }
                  }
                >
                  <TarotCard
                    image={d.card.image}
                    name={cardName(d.card, locale)}
                    reversed={d.reversed}
                    flipped={flipped[i] ?? false}
                    onFlip={() => toggle(i)}
                    glow={flipped[i] ?? false}
                  />
                  <p className="mt-2 text-center text-xs tracking-wider text-white/60 uppercase">
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
