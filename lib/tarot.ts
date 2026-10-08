// Reading engine — the single test seam of the app (see spec T2).
// Pure functions only: no I/O, no Date, no Math.random unless injected.
// Vocabulary follows GLOSSARY.md: Spread, Reading, Upright/Reversed,
// Position meaning vs Card meaning.

export interface DeckCard {
  id: string;
}

export interface PositionMeaning {
  /** 0-based index of the position within the spread */
  index: number;
  name_en: string;
  name_vi: string;
}

export interface SpreadDef {
  id: SpreadId;
  name_en: string;
  name_vi: string;
  positions: PositionMeaning[];
}

export type SpreadId = "single" | "three-card" | "celtic-cross";

export interface DrawnCard<T extends DeckCard = DeckCard> {
  card: T;
  position: PositionMeaning;
  /** true = Reversed (Ngược), false = Upright (Xuôi) */
  reversed: boolean;
}

/** Probability that a drawn card lands Reversed. */
export const REVERSED_RATE = 0.3;

export const SPREADS: Record<SpreadId, SpreadDef> = {
  single: {
    id: "single",
    name_en: "Single card",
    name_vi: "Một lá",
    positions: [{ index: 0, name_en: "Message", name_vi: "Thông điệp" }],
  },
  "three-card": {
    id: "three-card",
    name_en: "Past · Present · Future",
    name_vi: "Quá khứ · Hiện tại · Tương lai",
    positions: [
      { index: 0, name_en: "Past", name_vi: "Quá khứ" },
      { index: 1, name_en: "Present", name_vi: "Hiện tại" },
      { index: 2, name_en: "Future", name_vi: "Tương lai" },
    ],
  },
  "celtic-cross": {
    id: "celtic-cross",
    name_en: "Celtic Cross",
    name_vi: "Chữ thập Celtic",
    positions: [
      { index: 0, name_en: "Present", name_vi: "Hiện tại" },
      { index: 1, name_en: "Challenge", name_vi: "Thử thách" },
      { index: 2, name_en: "Past", name_vi: "Quá khứ" },
      { index: 3, name_en: "Near future", name_vi: "Tương lai gần" },
      { index: 4, name_en: "Conscious goal", name_vi: "Mục tiêu ý thức" },
      { index: 5, name_en: "Subconscious", name_vi: "Tiềm thức" },
      { index: 6, name_en: "Your attitude", name_vi: "Thái độ của bạn" },
      { index: 7, name_en: "External influences", name_vi: "Ảnh hưởng bên ngoài" },
      { index: 8, name_en: "Hopes and fears", name_vi: "Hy vọng và lo sợ" },
      { index: 9, name_en: "Outcome", name_vi: "Kết quả" },
    ],
  },
};

export interface DrawOptions {
  /** Random source in [0, 1). Defaults to Math.random. Inject a seeded PRNG in tests. */
  rand?: () => number;
  /** Override the default reversed probability (0..1). */
  reversedRate?: number;
}

/**
 * Fisher–Yates shuffle. Returns a NEW array; the input is never mutated.
 */
export function shuffle<T>(deck: readonly T[], rand: () => number = Math.random): T[] {
  const out = [...deck];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Draw a full Reading for a spread: shuffled deck, first N cards,
 * each tagged with its Position meaning + Upright/Reversed state.
 * Throws if the deck holds fewer cards than the spread needs.
 */
export function drawReading<T extends DeckCard>(
  deck: readonly T[],
  spreadId: SpreadId,
  options: DrawOptions = {},
): DrawnCard<T>[] {
  const spread = SPREADS[spreadId];
  if (deck.length < spread.positions.length) {
    throw new Error(
      `Need at least ${spread.positions.length} cards for ${spread.name_en}, got ${deck.length}`,
    );
  }
  const { rand = Math.random, reversedRate = REVERSED_RATE } = options;
  return shuffle(deck, rand)
    .slice(0, spread.positions.length)
    .map((card, i) => ({
      card,
      position: spread.positions[i],
      reversed: rand() < reversedRate,
    }));
}
