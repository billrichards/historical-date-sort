import { describe, it, expect } from "vitest";
import { parseJapanese, parseJapanesePlugin, gengoToCE } from "../src/plugins/japanese";

describe("parseJapanese", () => {
  describe("typical era inputs", () => {
    it("parses 'Meiji 34'", () => {
      expect(parseJapanese("Meiji 34")).toBe(1901);  // 1868 + 34 - 1
    });

    it("parses 'Showa 15'", () => {
      expect(parseJapanese("Showa 15")).toBe(1940);  // 1926 + 15 - 1
    });

    it("parses 'Taisho 5'", () => {
      expect(parseJapanese("Taisho 5")).toBe(1916);  // 1912 + 5 - 1
    });

    it("parses 'Heisei 1'", () => {
      expect(parseJapanese("Heisei 1")).toBe(1989);
    });

    it("parses 'Reiwa 1'", () => {
      expect(parseJapanese("Reiwa 1")).toBe(2019);
    });

    it("parses 'Reiwa 6'", () => {
      expect(parseJapanese("Reiwa 6")).toBe(2024);
    });
  });

  describe("case insensitivity", () => {
    it("parses 'meiji 34' (lowercase)", () => {
      expect(parseJapanese("meiji 34")).toBe(1901);
    });

    it("parses 'MEIJI 34' (uppercase)", () => {
      expect(parseJapanese("MEIJI 34")).toBe(1901);
    });
  });

  describe("macron normalization", () => {
    it("parses 'Shōwa 15' (macron over o)", () => {
      expect(parseJapanese("Shōwa 15")).toBe(1940);
    });

    it("parses 'Taishō 5' (macron over o)", () => {
      expect(parseJapanese("Taishō 5")).toBe(1916);
    });
  });

  describe("romanization variants", () => {
    it("parses 'Tempo 5' (alt spelling for Tenpo)", () => {
      expect(parseJapanese("Tempo 5")).toBe(1834);  // 1830 + 5 - 1
    });

    it("parses 'Tenpo 5'", () => {
      expect(parseJapanese("Tenpo 5")).toBe(1834);
    });
  });

  describe("pre-modern eras", () => {
    it("parses 'Genroku 5'", () => {
      expect(parseJapanese("Genroku 5")).toBe(1692);  // 1688 + 5 - 1
    });

    it("parses 'Keio 1'", () => {
      expect(parseJapanese("Keio 1")).toBe(1865);
    });

    it("parses 'Keicho 1'", () => {
      expect(parseJapanese("Keicho 1")).toBe(1596);
    });
  });

  describe("qualitative modifiers", () => {
    it("parses 'ca. Meiji 34'", () => {
      expect(parseJapanese("ca. Meiji 34")).toBe(1901);
    });

    it("after Meiji 34 adds +0.5", () => {
      expect(parseJapanese("after Meiji 34")).toBe(1901.5);
    });

    it("before Meiji 34 adds -0.5", () => {
      expect(parseJapanese("before Meiji 34")).toBe(1900.5);
    });
  });

  describe("false-positive guards (must return null from plugin)", () => {
    it("rejects plain '1923'", () => {
      expect(parseJapanesePlugin("1923")).toBeNull();
    });

    it("rejects '100 BC'", () => {
      expect(parseJapanesePlugin("100 BC")).toBeNull();
    });

    it("rejects 'AH 150'", () => {
      expect(parseJapanesePlugin("AH 150")).toBeNull();
    });

    it("rejects 'Ansei pottery, 1854' (4-digit year disqualifies)", () => {
      expect(parseJapanesePlugin("Ansei pottery, 1854")).toBeNull();
    });
  });

  describe("mine but garbled (Infinity, not null)", () => {
    it("'Meiji' with no number returns null — pattern requires digits, treated as not-mine", () => {
      expect(parseJapanesePlugin("Meiji")).toBeNull();
    });

    it("'Meiji 0' (year < 1) returns Infinity", () => {
      expect(parseJapanesePlugin("Meiji 0")).toBe(Infinity);
    });
  });

  describe("null/undefined/empty", () => {
    it("returns Infinity for null", () => expect(parseJapanese(null)).toBe(Infinity));
    it("returns Infinity for undefined", () => expect(parseJapanese(undefined)).toBe(Infinity));
    it("returns Infinity for empty string", () => expect(parseJapanese("")).toBe(Infinity));
  });
});
