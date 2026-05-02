import { describe, it, expect } from "vitest";
import { parseRegnal, parseRegnalPlugin } from "../src/plugins/regnal";
import type { RegnalResolver } from "../src/plugins/regnal";

const stubResolver: RegnalResolver = {
  resolve(ruler: string, regnalYear: number): number | null {
    const accession: Record<string, number> = {
      "henry iii":  1216,
      "henry viii": 1509,
      "edward i":   1272,
      "louis xiv":  1643,
    };
    const start = accession[ruler.toLowerCase()];
    return start !== undefined ? start + regnalYear - 1 : null;
  },
};

describe("parseRegnal", () => {
  describe("pattern: 'Year N of Ruler'", () => {
    it("parses 'Year 12 of Henry III'", () => {
      expect(parseRegnal("Year 12 of Henry III", { regnalResolver: stubResolver }))
        .toBe(1227);  // 1216 + 12 - 1
    });

    it("parses 'year 12 of henry iii' (lowercase)", () => {
      expect(parseRegnal("year 12 of henry iii", { regnalResolver: stubResolver }))
        .toBe(1227);
    });

    it("parses 'Regnal Year 12 of Henry III'", () => {
      expect(parseRegnal("Regnal Year 12 of Henry III", { regnalResolver: stubResolver }))
        .toBe(1227);
    });
  });

  describe("pattern: 'Nth year of Ruler'", () => {
    it("parses '3rd year of Edward I'", () => {
      expect(parseRegnal("3rd year of Edward I", { regnalResolver: stubResolver }))
        .toBe(1274);  // 1272 + 3 - 1
    });

    it("parses '1st year of Henry III'", () => {
      expect(parseRegnal("1st year of Henry III", { regnalResolver: stubResolver }))
        .toBe(1216);
    });

    it("parses '21st year of Louis XIV'", () => {
      expect(parseRegnal("21st year of Louis XIV", { regnalResolver: stubResolver }))
        .toBe(1663);  // 1643 + 21 - 1
    });
  });

  describe("pattern: 'Ruler yr. N' and 'Ruler year N'", () => {
    it("parses 'Henry VIII yr. 12'", () => {
      expect(parseRegnal("Henry VIII yr. 12", { regnalResolver: stubResolver }))
        .toBe(1520);  // 1509 + 12 - 1
    });

    it("parses 'Henry VIII yr 12' (no dot)", () => {
      expect(parseRegnal("Henry VIII yr 12", { regnalResolver: stubResolver }))
        .toBe(1520);
    });

    it("parses 'Henry VIII year 12'", () => {
      expect(parseRegnal("Henry VIII year 12", { regnalResolver: stubResolver }))
        .toBe(1520);
    });
  });

  describe("pattern: 'regnal year N' with regnalRuler option", () => {
    it("resolves with regnalRuler option", () => {
      expect(
        parseRegnal("regnal year 12", {
          regnalResolver: stubResolver,
          regnalRuler: "Henry III",
        })
      ).toBe(1227);
    });
  });

  describe("qualitative modifiers", () => {
    it("'ca. Year 12 of Henry III' → 1227", () => {
      expect(parseRegnal("ca. Year 12 of Henry III", { regnalResolver: stubResolver }))
        .toBe(1227);
    });

    it("'after Year 12 of Henry III' → 1227.5", () => {
      expect(parseRegnal("after Year 12 of Henry III", { regnalResolver: stubResolver }))
        .toBe(1227.5);
    });
  });

  describe("Infinity without resolver (mine, unresolvable)", () => {
    it("matched pattern with no resolver returns Infinity", () => {
      expect(parseRegnalPlugin("Year 12 of Henry III")).toBe(Infinity);
    });

    it("matched pattern with no resolver (yr. form) returns Infinity", () => {
      expect(parseRegnalPlugin("Henry VIII yr. 12")).toBe(Infinity);
    });

    it("unknown ruler returns Infinity", () => {
      expect(parseRegnal("Year 5 of Bob", { regnalResolver: stubResolver }))
        .toBe(Infinity);
    });

    it("regnal year < 1 returns Infinity", () => {
      expect(parseRegnal("Year 0 of Henry III", { regnalResolver: stubResolver }))
        .toBe(Infinity);
    });
  });

  describe("false-positive guards (must return null from plugin)", () => {
    it("rejects 'yearbook 2024'", () => {
      expect(parseRegnalPlugin("yearbook 2024")).toBeNull();
    });

    it("rejects 'This year is 2024'", () => {
      expect(parseRegnalPlugin("This year is 2024")).toBeNull();
    });

    it("rejects 'Year of the Dragon' (no integer)", () => {
      expect(parseRegnalPlugin("Year of the Dragon")).toBeNull();
    });

    it("rejects plain '1923'", () => {
      expect(parseRegnalPlugin("1923")).toBeNull();
    });

    it("rejects 'AH 150'", () => {
      expect(parseRegnalPlugin("AH 150")).toBeNull();
    });

    it("rejects 'AUC 754'", () => {
      expect(parseRegnalPlugin("AUC 754")).toBeNull();
    });
  });

  describe("null/undefined/empty", () => {
    it("returns Infinity for null", () => expect(parseRegnal(null)).toBe(Infinity));
    it("returns Infinity for undefined", () => expect(parseRegnal(undefined)).toBe(Infinity));
    it("returns Infinity for empty string", () => expect(parseRegnal("")).toBe(Infinity));
  });
});
