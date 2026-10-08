import { describe, expect, it } from "vitest";
import { readingToText, type SavedReading } from "./history";

const reading: SavedReading = {
  id: "r1",
  createdAt: "2026-10-08T00:00:00.000Z",
  spreadId: "three-card",
  question: "Việc tháng này?",
  locale: "vi",
  draws: [
    {
      cardId: "major-19",
      position_en: "Past",
      position_vi: "Quá khứ",
      reversed: false,
    },
    {
      cardId: "major-16",
      position_en: "Present",
      position_vi: "Hiện tại",
      reversed: true,
    },
  ],
};

describe("readingToText", () => {
  it("renders positions, card names and xuôi/ngược in Vietnamese", () => {
    const text = readingToText(
      reading,
      (id) => ({ "major-19": "Mặt Trời", "major-16": "Tháp" })[id] ?? id,
      "Ba lá",
      { upright: "Xuôi", reversed: "Ngược" },
    );
    expect(text).toContain("🔮 Ba lá");
    expect(text).toContain("Việc tháng này?");
    expect(text).toContain("1. Quá khứ — Mặt Trời (Xuôi)");
    expect(text).toContain("2. Hiện tại — Tháp (Ngược)");
  });

  it("omits the question line when empty", () => {
    const text = readingToText(
      { ...reading, question: "" },
      () => "X",
      "Ba lá",
      { upright: "Xuôi", reversed: "Ngược" },
    );
    expect(text).not.toContain("❝");
  });
});
