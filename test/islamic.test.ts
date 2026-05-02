import { describe, it, expect } from "vitest";
import { parseIslamic, parseIslamicPlugin, ahToCE } from "../src/plugins/islamic";

const PREC = 1; // decimal places for toBeCloseTo

describe("parseIslamic", () => {
  describe("typical AH inputs", () => {
    it("parses 'AH 150'", () => {
      expect(parseIslamic("AH 150")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses '150 AH'", () => {
      expect(parseIslamic("150 AH")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses 'A.H. 150'", () => {
      expect(parseIslamic("A.H. 150")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses 'a.h. 150' (lowercase)", () => {
      expect(parseIslamic("a.h. 150")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses 'A.H 150' (no trailing dot)", () => {
      expect(parseIslamic("A.H 150")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses 'AH150' (no space)", () => {
      expect(parseIslamic("AH150")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses '150 H' (catalog notation)", () => {
      expect(parseIslamic("150 H")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses 'Hijri 150'", () => {
      expect(parseIslamic("Hijri 150")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses 'Hejira 150'", () => {
      expect(parseIslamic("Hejira 150")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("parses 'hegira 150' (alt spelling, lowercase)", () => {
      expect(parseIslamic("hegira 150")).toBeCloseTo(ahToCE(150), PREC);
    });
  });

  describe("anchor sanity checks", () => {
    it("AH 1 ≈ 622.54 CE", () => {
      expect(parseIslamic("AH 1")).toBeCloseTo(622.54, 1);
    });

    it("AH 1446 ≈ 2024 CE", () => {
      expect(parseIslamic("AH 1446")).toBeCloseTo(2024, 0);
    });
  });

  describe("ranges", () => {
    it("parses 'AH 150-160' and returns start year CE", () => {
      expect(parseIslamic("AH 150-160")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("handles en-dash range", () => {
      expect(parseIslamic("AH 150–160")).toBeCloseTo(ahToCE(150), PREC);
    });

    it("handles em-dash range", () => {
      expect(parseIslamic("AH 150—160")).toBeCloseTo(ahToCE(150), PREC);
    });
  });

  describe("qualitative modifiers", () => {
    it("parses 'ca. AH 850'", () => {
      expect(parseIslamic("ca. AH 850")).toBeCloseTo(ahToCE(850), PREC);
    });

    it("parses 'circa AH 850'", () => {
      expect(parseIslamic("circa AH 850")).toBeCloseTo(ahToCE(850), PREC);
    });

    it("parses '~AH 850'", () => {
      expect(parseIslamic("~AH 850")).toBeCloseTo(ahToCE(850), PREC);
    });

    it("after AH 150 adds +0.5", () => {
      expect(parseIslamic("after AH 150")).toBeCloseTo(ahToCE(150) + 0.5, PREC);
    });

    it("before AH 150 adds -0.5", () => {
      expect(parseIslamic("before AH 150")).toBeCloseTo(ahToCE(150) - 0.5, PREC);
    });
  });

  describe("false-positive guards (must return Infinity from public function)", () => {
    it("rejects '1500 mm'", () => {
      expect(parseIslamicPlugin("1500 mm")).toBeNull();
    });

    it("rejects 'Hour 5'", () => {
      expect(parseIslamicPlugin("Hour 5")).toBeNull();
    });

    it("rejects '5H pencil'", () => {
      expect(parseIslamicPlugin("5H pencil")).toBeNull();
    });

    it("rejects 'Channel 5'", () => {
      expect(parseIslamicPlugin("Channel 5")).toBeNull();
    });

    it("rejects plain '1923'", () => {
      expect(parseIslamicPlugin("1923")).toBeNull();
    });

    it("rejects '100 BC'", () => {
      expect(parseIslamicPlugin("100 BC")).toBeNull();
    });

    it("rejects 'Anno Mundi 5000'", () => {
      expect(parseIslamicPlugin("Anno Mundi 5000")).toBeNull();
    });

    it("rejects 'Meiji 34'", () => {
      expect(parseIslamicPlugin("Meiji 34")).toBeNull();
    });
  });

  describe("mine but garbled (Infinity, not null)", () => {
    it("'AH' with no number returns Infinity", () => {
      expect(parseIslamicPlugin("AH")).toBe(Infinity);
    });

    it("'AH unknown' returns Infinity", () => {
      expect(parseIslamicPlugin("AH unknown")).toBe(Infinity);
    });
  });

  describe("null/undefined/empty", () => {
    it("returns Infinity for null", () => {
      expect(parseIslamic(null)).toBe(Infinity);
    });

    it("returns Infinity for undefined", () => {
      expect(parseIslamic(undefined)).toBe(Infinity);
    });

    it("returns Infinity for empty string", () => {
      expect(parseIslamic("")).toBe(Infinity);
    });
  });
});
