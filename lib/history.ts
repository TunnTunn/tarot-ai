import type { Locale } from "@/lib/cards";
import type { SpreadId } from "@/lib/tarot";

export interface SavedDraw {
  cardId: string;
  position_en: string;
  position_vi: string;
  reversed: boolean;
}

export interface SavedReading {
  id: string;
  createdAt: string;
  spreadId: SpreadId;
  question: string;
  locale: Locale;
  draws: SavedDraw[];
}

const STORAGE_KEY = "tarot:readings:v1";
const MAX_ENTRIES = 50;

function readRaw(): SavedReading[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedReading[]) : [];
  } catch {
    return [];
  }
}

export function loadHistory(): SavedReading[] {
  return readRaw().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function saveReading(
  entry: Omit<SavedReading, "id" | "createdAt">,
): SavedReading {
  const saved: SavedReading = {
    ...entry,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
    createdAt: new Date().toISOString(),
  };
  try {
    const next = [saved, ...readRaw()].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full/unavailable — reading still shown on screen
  }
  return saved;
}

export function deleteReading(id: string): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(readRaw().filter((r) => r.id !== id)),
    );
  } catch {
    // ignore
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Plain-text version of a reading for copy/share. */
export function readingToText(
  reading: SavedReading,
  cardName: (cardId: string, locale: Locale) => string,
  spreadName: string,
  labels: { upright: string; reversed: string },
): string {
  const lines = [
    `🔮 ${spreadName}`,
    reading.question ? `❝ ${reading.question} ❞` : null,
    "",
    ...reading.draws.map((d, i) => {
      const state = d.reversed ? labels.reversed : labels.upright;
      const pos = reading.locale === "vi" ? d.position_vi : d.position_en;
      return `${i + 1}. ${pos} — ${cardName(d.cardId, reading.locale)} (${state})`;
    }),
  ];
  return lines.filter((l) => l !== null).join("\n");
}
