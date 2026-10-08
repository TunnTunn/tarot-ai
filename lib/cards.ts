import cards from "@/data/cards.json";

export type Arcana = "major" | "minor";
export type Suit = "wands" | "cups" | "swords" | "pentacles";
export type Locale = "vi" | "en";

export interface TarotCardData {
  id: string;
  arcana: Arcana;
  suit: Suit | null;
  number: number;
  name_en: string;
  name_vi: string;
  keywords_en: string[];
  keywords_vi: string[];
  upright_en: string;
  upright_vi: string;
  reversed_en: string;
  reversed_vi: string;
  image: string;
}

export const ALL_CARDS = cards as TarotCardData[];

const byId = new Map(ALL_CARDS.map((c) => [c.id, c]));

export function getCardById(id: string): TarotCardData {
  const card = byId.get(id);
  if (!card) throw new Error(`Unknown card id: ${id}`);
  return card;
}

export function cardName(card: TarotCardData, locale: Locale): string {
  return locale === "vi" ? card.name_vi : card.name_en;
}

export function cardKeywords(card: TarotCardData, locale: Locale): string[] {
  return locale === "vi" ? card.keywords_vi : card.keywords_en;
}

export function cardMeaning(
  card: TarotCardData,
  reversed: boolean,
  locale: Locale,
): string {
  if (locale === "vi") return reversed ? card.reversed_vi : card.upright_vi;
  return reversed ? card.reversed_en : card.upright_en;
}
