import { describe, it, expect } from "vitest";
import { parseHistoricalDate, compareHistoricalDates } from "../src/index";
import type { RegnalResolver } from "../src/types";

const stubResolver: RegnalResolver = {
  resolve(ruler: string, regnalYear: number): number | null {
    const accession: Record<string, number> = {
      "Henry III":  1216,
      "Henry VIII": 1509,
      "Edward I":   1272,
    };
    const start = accession[ruler];
    return start !== undefined ? start + regnalYear - 1 : null;
  },
};

describe("parseHistoricalDate — plugin priority", () => {
  it("'Meiji 34' returns 1901 (Japanese, not Gregorian year 34)", () => {
    expect(parseHistoricalDate("Meiji 34")).toBe(1901);
  });

  it("'AH 150' returns ~767 CE (Islamic, not Gregorian year 150)", () => {
    expect(parseHistoricalDate("AH 150")).toBeCloseTo(767, 0);
  });

  it("'AM 5786' returns 2025 (Hebrew)", () => {
    expect(parseHistoricalDate("AM 5786")).toBe(2025);
  });

  it("'AUC 754' returns 1 (Roman)", () => {
    expect(parseHistoricalDate("AUC 754")).toBe(1);
  });

  it("'ca. 450 BCE' returns -450 (Gregorian)", () => {
    expect(parseHistoricalDate("ca. 450 BCE")).toBe(-450);
  });

  it("disabling Islamic: 'AH 150' returns Infinity from Gregorian (structural guard rejects non-Gregorian markers)", () => {
    expect(parseHistoricalDate("AH 150", { calendars: ["gregorian"] })).toBe(Infinity);
  });

  it("calendar filtering works: '150 CE' with only gregorian enabled returns 150", () => {
    expect(parseHistoricalDate("150 CE", { calendars: ["gregorian"] })).toBe(150);
  });

  it("'Year 12 of Henry III' without resolver returns Infinity", () => {
    expect(parseHistoricalDate("Year 12 of Henry III")).toBe(Infinity);
  });

  it("'Year 12 of Henry III' with resolver returns 1227", () => {
    expect(
      parseHistoricalDate("Year 12 of Henry III", { regnalResolver: stubResolver })
    ).toBe(1227);
  });

  it("unknown calendar name throws", () => {
    expect(() =>
      parseHistoricalDate("1923", { calendars: ["klingon"] as never })
    ).toThrow();
  });
});

describe("parseHistoricalDate — structural guard", () => {
  it("'10 AM Tuesday' returns Infinity (not 10 CE)", () => {
    expect(parseHistoricalDate("10 AM Tuesday")).toBe(Infinity);
  });

  it("'Hour 5' returns Infinity", () => {
    expect(parseHistoricalDate("Hour 5")).toBe(Infinity);
  });

  it("'page 5' returns Infinity", () => {
    expect(parseHistoricalDate("page 5")).toBe(Infinity);
  });

  it("'Unknown date' returns Infinity", () => {
    expect(parseHistoricalDate("Unknown date")).toBe(Infinity);
  });
});

describe("compareHistoricalDates", () => {
  it("sorts ascending chronologically", () => {
    const dates = [
      "1921",
      "ca. 450 BCE",
      "AH 150",
      "49-44 BC",
      "Meiji 34",
    ];
    const sorted = [...dates].sort(compareHistoricalDates);
    expect(sorted).toEqual([
      "ca. 450 BCE",   // -450
      "49-44 BC",      // -49
      "AH 150",        // ~767
      "Meiji 34",      // 1901
      "1921",          // 1921
    ]);
  });

  it("unparseable strings sort last", () => {
    const dates = ["1921", "Unknown date", "AH 150"];
    const sorted = [...dates].sort(compareHistoricalDates);
    expect(sorted[sorted.length - 1]).toBe("Unknown date");
  });

  it("two unparseable strings compare as equal (returns 0)", () => {
    expect(compareHistoricalDates("Unknown", "???")).toBe(0);
  });

  it("null sorts last", () => {
    const result = compareHistoricalDates(null, "1923");
    expect(result).toBeGreaterThan(0);
  });

  it("null vs null returns 0", () => {
    expect(compareHistoricalDates(null, null)).toBe(0);
  });
});

describe("mixed-calendar sort scenario", () => {
  const records = [
    { id: "G1", date: "1921" },
    { id: "G2", date: "ca. 450 BCE" },
    { id: "I1", date: "AH 150" },
    { id: "H1", date: "AM 5786" },
    { id: "H2", date: "[5786]" },
    { id: "R1", date: "AUC 754" },
    { id: "J1", date: "Meiji 34" },
    { id: "X1", date: "Unknown date" },
  ];

  it("sorts cross-calendar records chronologically", () => {
    const sorted = [...records].sort((a, b) =>
      compareHistoricalDates(a.date, b.date)
    );
    const ids = sorted.map(r => r.id);
    // Expected: ca.450BCE, AH150(~767CE), AUC754(1CE), Meiji34(1901CE), 1921CE, AM5786(2025CE), [5786](2025CE), Unknown
    // Note: AH150 ≈ 767CE, so: G2(-450), I1(767), R1(1CE)... wait, AUC 754 = 1 CE
    // Correct order: G2(-450), R1(1CE), I1(767CE), J1(1901CE), G1(1921CE), H1(2025CE), H2(2025CE), X1(Inf)
    expect(ids.indexOf("G2")).toBeLessThan(ids.indexOf("R1"));  // BCE before CE
    expect(ids.indexOf("R1")).toBeLessThan(ids.indexOf("I1"));  // 1 CE before 767 CE
    expect(ids.indexOf("I1")).toBeLessThan(ids.indexOf("J1"));  // 767 before 1901
    expect(ids.indexOf("J1")).toBeLessThan(ids.indexOf("G1"));  // 1901 before 1921
    expect(ids.indexOf("G1")).toBeLessThan(ids.indexOf("H1"));  // 1921 before 2025
    expect(ids.lastIndexOf("X1")).toBe(ids.length - 1);         // Unknown last
  });
});

describe("after/before modifiers across calendars", () => {
  it("'after 217 BC' sorts between 218 BC and 217 BC", () => {
    const k = parseHistoricalDate("after 217 BC");
    expect(k).toBeGreaterThan(-217);
    expect(k).toBeLessThan(-216);
  });

  it("'before 217 BC' sorts deeper in past than 217 BC", () => {
    const k = parseHistoricalDate("before 217 BC");
    expect(k).toBeLessThan(-217);
    expect(k).toBeGreaterThan(-218);
  });

  it("'after AH 150' sorts between AH 150 and AH 151", () => {
    const k = parseHistoricalDate("after AH 150");
    const ah150 = parseHistoricalDate("AH 150");
    const ah151 = parseHistoricalDate("AH 151");
    expect(k).toBeGreaterThan(ah150);
    expect(k).toBeLessThan(ah151);
  });
});
