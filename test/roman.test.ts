import { describe, it, expect } from "vitest";
import { parseRoman, parseRomanPlugin, parseRomanNumeral, toRomanNumeral, aucToCE } from "../src/plugins/roman";

describe("parseRomanNumeral", () => {
  describe("valid inputs", () => {
    it("parses I", () => expect(parseRomanNumeral("I")).toBe(1));
    it("parses IV", () => expect(parseRomanNumeral("IV")).toBe(4));
    it("parses IX", () => expect(parseRomanNumeral("IX")).toBe(9));
    it("parses XL", () => expect(parseRomanNumeral("XL")).toBe(40));
    it("parses XC", () => expect(parseRomanNumeral("XC")).toBe(90));
    it("parses CD", () => expect(parseRomanNumeral("CD")).toBe(400));
    it("parses CM", () => expect(parseRomanNumeral("CM")).toBe(900));
    it("parses DCCLIV", () => expect(parseRomanNumeral("DCCLIV")).toBe(754));
    it("parses MMDCCLXXVII", () => expect(parseRomanNumeral("MMDCCLXXVII")).toBe(2777));
    it("parses MMMCMXCIX (3999)", () => expect(parseRomanNumeral("MMMCMXCIX")).toBe(3999));
    it("parses DCCXVI", () => expect(parseRomanNumeral("DCCXVI")).toBe(716));
  });

  describe("invalid inputs", () => {
    it("returns null for MMMM (exceeds repeat limit)", () => {
      expect(parseRomanNumeral("MMMM")).toBeNull();
    });

    it("returns null for IIII", () => {
      expect(parseRomanNumeral("IIII")).toBeNull();
    });

    it("returns null for VV", () => {
      expect(parseRomanNumeral("VV")).toBeNull();
    });

    it("returns null for IC (non-canonical subtractive)", () => {
      expect(parseRomanNumeral("IC")).toBeNull();
    });

    it("returns null for XM (non-canonical subtractive)", () => {
      expect(parseRomanNumeral("XM")).toBeNull();
    });

    it("returns null for IL (non-canonical)", () => {
      expect(parseRomanNumeral("IL")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(parseRomanNumeral("")).toBeNull();
    });

    it("returns null for non-Roman characters", () => {
      expect(parseRomanNumeral("ABC")).toBeNull();
    });

    it("returns null for lowercase", () => {
      expect(parseRomanNumeral("xiv")).toBeNull();
    });
  });
});

describe("parseRoman (AUC)", () => {
  describe("Arabic year inputs", () => {
    it("parses 'AUC 754'", () => {
      expect(parseRoman("AUC 754")).toBe(aucToCE(754));
    });

    it("parses '754 AUC'", () => {
      expect(parseRoman("754 AUC")).toBe(aucToCE(754));
    });

    it("parses 'A.U.C. 754'", () => {
      expect(parseRoman("A.U.C. 754")).toBe(aucToCE(754));
    });

    it("parses 'auc 754' (lowercase)", () => {
      expect(parseRoman("auc 754")).toBe(aucToCE(754));
    });

    it("parses 'AUC 1000'", () => {
      expect(parseRoman("AUC 1000")).toBe(aucToCE(1000));
    });
  });

  describe("Roman numeral year inputs", () => {
    it("parses 'DCCLIV AUC'", () => {
      expect(parseRoman("DCCLIV AUC")).toBe(aucToCE(754));
    });

    it("parses 'AUC DCCLIV'", () => {
      expect(parseRoman("AUC DCCLIV")).toBe(aucToCE(754));
    });

    it("parses 'DCCXVI AUC'", () => {
      expect(parseRoman("DCCXVI AUC")).toBe(aucToCE(716));
    });

    it("parses 'MMDCCLXXVII AUC'", () => {
      expect(parseRoman("MMDCCLXXVII AUC")).toBe(aucToCE(2777));
    });
  });

  describe("anchor sanity checks", () => {
    it("AUC 754 → CE 1", () => expect(parseRoman("AUC 754")).toBe(1));
    it("AUC 753 → CE 0 (1 BCE)", () => expect(parseRoman("AUC 753")).toBe(0));
    it("AUC 1 → astronomical -752 (753 BCE)", () => expect(parseRoman("AUC 1")).toBe(-752));
  });

  describe("ranges", () => {
    it("parses 'AUC 754-760' and returns start", () => {
      expect(parseRoman("AUC 754-760")).toBe(aucToCE(754));
    });
  });

  describe("qualitative modifiers", () => {
    it("parses 'ca. AUC 754'", () => {
      expect(parseRoman("ca. AUC 754")).toBe(aucToCE(754));
    });

    it("parses 'circa DCCLIV AUC'", () => {
      expect(parseRoman("circa DCCLIV AUC")).toBe(aucToCE(754));
    });

    it("after AUC 754 adds +0.5", () => {
      expect(parseRoman("after AUC 754")).toBe(aucToCE(754) + 0.5);
    });

    it("before AUC 754 adds -0.5", () => {
      expect(parseRoman("before AUC 754")).toBe(aucToCE(754) - 0.5);
    });
  });

  describe("false-positive guards (must return null from plugin)", () => {
    it("rejects bare Roman numeral without AUC marker", () => {
      expect(parseRomanPlugin("DCCXVI")).toBeNull();
    });

    it("rejects 'Volume IV'", () => {
      expect(parseRomanPlugin("Volume IV")).toBeNull();
    });

    it("rejects 'page CIV'", () => {
      expect(parseRomanPlugin("page CIV")).toBeNull();
    });

    it("rejects 'Henry VIII yr. 12'", () => {
      expect(parseRomanPlugin("Henry VIII yr. 12")).toBeNull();
    });

    it("rejects 'AH 150'", () => {
      expect(parseRomanPlugin("AH 150")).toBeNull();
    });

    it("rejects '100 CE'", () => {
      expect(parseRomanPlugin("100 CE")).toBeNull();
    });
  });

  describe("mine but garbled (Infinity, not null)", () => {
    it("'AUC' alone returns Infinity", () => {
      expect(parseRomanPlugin("AUC")).toBe(Infinity);
    });

    it("'AUC IIII' (malformed Roman) returns Infinity", () => {
      expect(parseRomanPlugin("AUC IIII")).toBe(Infinity);
    });

    it("'AUC XYZ' (invalid characters) returns Infinity", () => {
      expect(parseRomanPlugin("AUC XYZ")).toBe(Infinity);
    });
  });

  describe("null/undefined/empty", () => {
    it("returns Infinity for null", () => expect(parseRoman(null)).toBe(Infinity));
    it("returns Infinity for undefined", () => expect(parseRoman(undefined)).toBe(Infinity));
    it("returns Infinity for empty string", () => expect(parseRoman("")).toBe(Infinity));
  });
});
