import { describe, it, expect } from "vitest";
import { formatHistoricalDate } from "../src/format";

describe("formatHistoricalDate", () => {
  describe("default (Gregorian) formatting", () => {
    it("formats positive year as CE", () => {
      expect(formatHistoricalDate(1923)).toBe("1923 CE");
    });

    it("formats negative year as BCE", () => {
      expect(formatHistoricalDate(-450)).toBe("450 BCE");
    });

    it("formats year 0", () => {
      expect(formatHistoricalDate(0)).toBe("0 CE");
    });

    it("formats year 1", () => {
      expect(formatHistoricalDate(1)).toBe("1 CE");
    });

    it("formats year -1 as 1 BCE", () => {
      expect(formatHistoricalDate(-1)).toBe("1 BCE");
    });

    it("formats large positive year", () => {
      expect(formatHistoricalDate(9999)).toBe("9999 CE");
    });

    it("formats large negative year", () => {
      expect(formatHistoricalDate(-9999)).toBe("9999 BCE");
    });
  });

  describe("Islamic calendar formatting", () => {
    it("formats Islamic date", () => {
      expect(formatHistoricalDate(767.12, { calendar: "islamic" })).toBe("AH 150");
    });

    it("formats early Islamic date (CE 622 ≈ AH 0)", () => {
      expect(formatHistoricalDate(622, { calendar: "islamic" })).toBe("AH 0");
    });

    it("formats modern Islamic date", () => {
      expect(formatHistoricalDate(2025, { calendar: "islamic" })).toBe("AH 1447");
    });
  });

  describe("Hebrew calendar formatting", () => {
    it("formats Hebrew date", () => {
      expect(formatHistoricalDate(2025, { calendar: "hebrew" })).toBe("AM 5786");
    });

    it("formats ancient Hebrew date", () => {
      expect(formatHistoricalDate(-3760, { calendar: "hebrew" })).toBe("AM 1");
    });

    it("formats year 0 in Hebrew calendar", () => {
      expect(formatHistoricalDate(0, { calendar: "hebrew" })).toBe("AM 3761");
    });
  });

  describe("Roman calendar formatting", () => {
    it("formats Roman date (AUC 754 = 1 CE)", () => {
      expect(formatHistoricalDate(1, { calendar: "roman" })).toBe("754 AUC");
    });

    it("formats year 0 as AUC 753", () => {
      expect(formatHistoricalDate(0, { calendar: "roman" })).toBe("753 AUC");
    });

    it("formats negative year as BCE-equivalent AUC", () => {
      expect(formatHistoricalDate(-1, { calendar: "roman" })).toBe("752 AUC");
    });

    it("formats modern year", () => {
      expect(formatHistoricalDate(2025, { calendar: "roman" })).toBe("2778 AUC");
    });
  });

  describe("Japanese calendar formatting", () => {
    it("formats Meiji era date", () => {
      expect(formatHistoricalDate(1901, { calendar: "japanese" })).toBe("Meiji 34");
    });

    it("formats Reiwa era date", () => {
      expect(formatHistoricalDate(2024, { calendar: "japanese" })).toBe("Reiwa 6");
    });

    it("formats Showa era date", () => {
      expect(formatHistoricalDate(1940, { calendar: "japanese" })).toBe("Showa 15");
    });

    it("falls back to Gregorian for pre-Meio dates", () => {
      expect(formatHistoricalDate(1400, { calendar: "japanese" })).toBe("1400 CE");
    });
  });

  describe("regnal calendar (falls back to Gregorian)", () => {
    it("formats regnal as Gregorian", () => {
      expect(formatHistoricalDate(1227, { calendar: "regnal" })).toBe("1227 CE");
    });

    it("formats negative year", () => {
      expect(formatHistoricalDate(-450, { calendar: "regnal" })).toBe("450 BCE");
    });
  });

  describe("explicit Gregorian calendar option", () => {
    it("formats with explicit gregorian option", () => {
      expect(formatHistoricalDate(1923, { calendar: "gregorian" })).toBe("1923 CE");
    });

    it("formats BCE with explicit gregorian option", () => {
      expect(formatHistoricalDate(-217, { calendar: "gregorian" })).toBe("217 BCE");
    });
  });

  describe("edge cases", () => {
    it("rounds fractional years in Gregorian", () => {
      expect(formatHistoricalDate(1923.5)).toBe("1924 CE");
    });

    it("rounds fractional years in Islamic", () => {
      expect(formatHistoricalDate(767.12, { calendar: "islamic" })).toBe("AH 150");
    });

    it("formats Infinity as Infinity CE", () => {
      expect(formatHistoricalDate(Infinity)).toBe("Infinity CE");
    });

    it("formats negative Infinity as Infinity BCE", () => {
      expect(formatHistoricalDate(-Infinity)).toBe("Infinity BCE");
    });

    it("formats NaN as NaN CE", () => {
      expect(formatHistoricalDate(NaN)).toBe("NaN CE");
    });
  });
});
