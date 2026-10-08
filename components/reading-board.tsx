"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RotateCcw, Shuffle, Sparkles } from "lucide-react";
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

  const togglePick = (id: string) =>
    setPickedIds((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
        : prev.length >= need
          ? prev
          : [...prev, id],
    );

  const deal = () => {
    const picked = pickedIds
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

            <div className="sticky top-2 z-10 mx-auto mt-5 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-[#141233]/90 px-4 py-2 backdrop-blur">
              <span className="text-sm tabular-nums text-amber-100">
                {pickedIds.length}/{need} {t("chosenOf")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={startChoosing}
                className="rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <Shuffle className="h-4 w-4" />
                {t("reshuffle")}
              </Button>
              <Button
                size="sm"
                disabled={pickedIds.length !== need}
                onClick={deal}
                className="rounded-full bg-amber-300 font-semibold text-indigo-950 transition-transform duration-150 ease-out hover:bg-amber-200 enabled:active:scale-[0.96] disabled:opacity-40"
              >
                {t("dealNow")}
              </Button>
            </div>

            <div className="mt-6 overflow-x-auto pb-8">
              <div
                className="relative mx-auto h-52"
                style={{ width: fan.length * 15 + 64 }}
              >
                {fan.map((card, order) => {
                  const center = (fan.length - 1) / 2;
                  const off = order - center;
                  const angle = off * 1.5;
                  const x = off * 15;
                  const y = Math.pow(off / center, 2) * 20;
                  const pickIndex = pickedIds.indexOf(card.id);
                  const selected = pickIndex >= 0;
                  return (
                    <button
                      key={`${card.id}-${order}`}
                      type="button"
                      onClick={() => togglePick(card.id)}
                      aria-label={cardName(card, locale)}
                      aria-pressed={selected}
                      style={{
                        left: `calc(50% + ${x}px)`,
                        transform: `translateX(-50%) translateY(${selected ? y - 22 : y}px) rotate(${angle}deg)`,
                        zIndex: selected ? 200 + pickIndex : order,
                      }}
                      className={cn(
                        "absolute bottom-2 h-24 w-16 rounded-lg border bg-gradient-to-br from-indigo-950 via-[#141233] to-violet-950 transition-[transform,box-shadow,border-color] duration-150 ease-out",
                        selected
                          ? "border-amber-300 shadow-[0_0_20px_-4px_rgba(251,191,36,0.7)]"
                          : "border-amber-200/25 hover:border-amber-200/60",
                      )}
                    >
                      <span className="flex h-full flex-col items-center justify-center">
                        <span
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums",
                            selected
                              ? "bg-amber-300 text-indigo-950"
                              : "border border-amber-200/40 text-amber-200/60",
                          )}
                        >
                          {selected ? pickIndex + 1 : "✦"}
                        </span>
                      </span>
                    </button>
                  );
                })}
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
