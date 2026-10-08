import { describe, expect, it } from "vitest";
import {
  REVERSED_RATE,
  SPREADS,
  drawReading,
  shuffle,
  type DeckCard,
  type SpreadId,
} from "./tarot";

// Deterministic PRNG (mulberry32) so tests never flake.
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const deck: DeckCard[] = Array.from({ length: 78 }, (_, i) => ({
  id: `card-${i}`,
}));

describe("shuffle", () => {
  it("keeps every card exactly once", () => {
    const out = shuffle(deck, seeded(1));
    expect(out).toHaveLength(78);
    expect(new Set(out.map((c) => c.id)).size).toBe(78);
    expect([...out.map((c) => c.id)].sort()).toEqual(
      deck.map((c) => c.id).sort(),
    );
  });

  it("does not mutate the input deck", () => {
    const before = deck.map((c) => c.id);
    shuffle(deck, seeded(2));
    expect(deck.map((c) => c.id)).toEqual(before);
  });

  it("is deterministic with the same seed", () => {
    expect(shuffle(deck, seeded(7)).map((c) => c.id)).toEqual(
      shuffle(deck, seeded(7)).map((c) => c.id),
    );
  });

  it("actually reorders (different seed, different order)", () => {
    expect(shuffle(deck, seeded(7)).map((c) => c.id)).not.toEqual(
      shuffle(deck, seeded(8)).map((c) => c.id),
    );
  });
});

describe("SPREADS", () => {
  const cases: [SpreadId, number][] = [
    ["single", 1],
    ["three-card", 3],
    ["celtic-cross", 10],
  ];
  it.each(cases)("%s has %i positions with VI/EN names", (id, n) => {
    expect(SPREADS[id].positions).toHaveLength(n);
    for (const p of SPREADS[id].positions) {
      expect(p.name_en.trim().length).toBeGreaterThan(0);
      expect(p.name_vi.trim().length).toBeGreaterThan(0);
    }
  });

  it("celtic-cross position 1 is Present / Hiện tại", () => {
    expect(SPREADS["celtic-cross"].positions[0]).toMatchObject({
      name_en: "Present",
      name_vi: "Hiện tại",
    });
  });

  it("three-card positions are Past / Present / Future", () => {
    expect(SPREADS["three-card"].positions.map((p) => p.name_en)).toEqual([
      "Past",
      "Present",
      "Future",
    ]);
  });
});

describe("drawReading", () => {
  it("draws 1 unique card for single with its position", () => {
    const [drawn] = drawReading(deck, "single", { rand: seeded(3) });
    expect(drawn.position.name_en).toBe("Message");
    expect(drawn.position.name_vi).toBe("Thông điệp");
    expect(typeof drawn.reversed).toBe("boolean");
  });

  it("draws 3 unique cards for three-card", () => {
    const out = drawReading(deck, "three-card", { rand: seeded(4) });
    expect(out).toHaveLength(3);
    expect(new Set(out.map((d) => d.card.id)).size).toBe(3);
  });

  it("draws 10 unique cards for celtic-cross", () => {
    const out = drawReading(deck, "celtic-cross", { rand: seeded(5) });
    expect(out).toHaveLength(10);
    expect(new Set(out.map((d) => d.card.id)).size).toBe(10);
    expect(out[9].position.name_en).toBe("Outcome");
  });

  it("rand always 0 => every card reversed; always 0.99 => none reversed", () => {
    const allRev = drawReading(deck, "celtic-cross", { rand: () => 0 });
    expect(allRev.every((d) => d.reversed)).toBe(true);
    const noneRev = drawReading(deck, "celtic-cross", { rand: () => 0.99 });
    expect(noneRev.every((d) => !d.reversed)).toBe(true);
  });

  it(`reversed ratio converges near REVERSED_RATE (${REVERSED_RATE})`, () => {
    const out = drawReading(deck, "celtic-cross", { rand: seeded(42) });
    // 10 draws is noisy; draw repeatedly with fresh seeds instead
    let rev = 0;
    let total = 0;
    for (let s = 0; s < 200; s++) {
      for (const d of drawReading(deck, "three-card", { rand: seeded(s) })) {
        total++;
        if (d.reversed) rev++;
      }
    }
    expect(rev / total).toBeGreaterThan(REVERSED_RATE - 0.1);
    expect(rev / total).toBeLessThan(REVERSED_RATE + 0.1);
    expect(out).toHaveLength(10);
  });

  it("throws when the deck is smaller than the spread", () => {
    expect(() => drawReading(deck.slice(0, 5), "celtic-cross")).toThrow(
      /need at least 10 cards/i,
    );
  });

  it("does not mutate the input deck", () => {
    const before = deck.map((c) => c.id);
    drawReading(deck, "celtic-cross", { rand: seeded(9) });
    expect(deck.map((c) => c.id)).toEqual(before);
  });
});
