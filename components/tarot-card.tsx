"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";
import { MoonStar } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export type FlipPresetName = "snappy" | "soft" | "dramatic";

export const FLIP_PRESETS: Record<FlipPresetName, Transition> = {
  snappy: { type: "spring", stiffness: 420, damping: 32 },
  soft: { type: "spring", stiffness: 170, damping: 22 },
  dramatic: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
};

/** The default flip used across the whole app. */
export const DEFAULT_FLIP: FlipPresetName = "soft";

interface TarotCardProps {
  image: string;
  name: string;
  reversed: boolean;
  flipped: boolean;
  onFlip?: () => void;
  preset?: FlipPresetName;
  glow?: boolean;
  size?: "md" | "lg";
}

/**
 * A tarot card with a true 3D flip. Front face is a CSS-only mystical
 * back design; the card face shows the artwork (rotated 180° when reversed).
 */
export function TarotCard({
  image,
  name,
  reversed,
  flipped,
  onFlip,
  preset = DEFAULT_FLIP,
  glow = false,
  size = "md",
}: TarotCardProps) {
  const reduceMotion = useReducedMotion();
  const transition: Transition = reduceMotion
    ? { duration: 0.01 }
    : FLIP_PRESETS[preset];

  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={name}
      aria-pressed={flipped}
      className={cn(
        "group relative aspect-[3/5] w-full cursor-pointer [perspective:1200px]",
        "rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e0928]",
        size === "lg" && "mx-auto max-w-56",
      )}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={transition}
      >
        {/* Card back (face down) */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-2xl border border-amber-200/30 bg-gradient-to-br from-indigo-950 via-[#141233] to-violet-950 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] [backface-visibility:hidden]",
            "transition-shadow duration-500 group-hover:shadow-[0_18px_60px_-12px_rgba(251,191,36,0.35)]",
            glow && "shadow-[0_0_45px_-8px_rgba(251,191,36,0.55)]",
          )}
        >
          <div className="absolute inset-2 rounded-xl border border-amber-200/25" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(251,191,36,0.16),transparent_60%)]" />
          <div className="flex h-full flex-col items-center justify-center gap-3 text-amber-200/80">
            <MoonStar className="h-10 w-10" strokeWidth={1.25} />
            <div className="h-px w-16 bg-gradient-to-r from-transparent via-amber-200/60 to-transparent" />
            <p className="font-display text-xs tracking-[0.3em] uppercase">
              Tarot
            </p>
          </div>
        </div>

        {/* Card face (artwork) */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-amber-200/40 bg-indigo-950 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] outline-1 outline-white/10 -outline-offset-1 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className={cn("h-full w-full", reversed && "rotate-180")}>
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 40vw, 220px"
              className="object-cover"
              draggable={false}
            />
          </div>
        </div>
      </motion.div>
    </button>
  );
}
