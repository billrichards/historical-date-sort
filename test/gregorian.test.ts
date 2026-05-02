import { describe, it, expect } from "vitest";
import { parseGregorian, formatGregorian } from "../src/plugins/gregorian";

describe("parseGregorian", () => {
  describe("basic year parsing", () => {
    it("parses simple 4-digit year", () => {
      expect(parseGregorian("1923")).toBe(1923);
    });

    it("parses year with trailing spaces", () => {
      expect(parseGregorian("  1923  ")).toBe(1923);
    });

    it("parses 3-digit year", () => {
      expect(parseGregorian("334")).toBe(334);
    });

    it("returns Infinity for null input", () => {
      expect(parseGregorian(null)).toBe(Infinity);
    });

    it("returns Infinity for undefined input", () => {
      expect(parseGregorian(undefined)).toBe(Infinity);
    });

    it("returns Infinity for empty string", () => {
      expect(parseGregorian("")).toBe(Infinity);
    });

    it("returns Infinity for whitespace-only string", () => {
      expect(parseGregorian("   ")).toBe(Infinity);
    });
  });

  describe("era markers (BC/BCE/AD/CE)", () => {
    it("parses year with AD suffix", () => {
      expect(parseGregorian("334 AD")).toBe(334);
    });

    it("parses year with CE suffix", () => {
      expect(parseGregorian("334 CE")).toBe(334);
    });

    it("parses year with BC suffix as negative", () => {
      expect(parseGregorian("217 BC")).toBe(-217);
    });

    it("parses year with BCE suffix as negative", () => {
      expect(parseGregorian("217 BCE")).toBe(-217);
    });

    it("handles case-insensitive era markers", () => {
      expect(parseGregorian("100 bc")).toBe(-100);
      expect(parseGregorian("100 Bc")).toBe(-100);
      expect(parseGregorian("100 BC")).toBe(-100);
    });
  });

  describe("year ranges", () => {
    it("parses AD/CE range and returns start year", () => {
      expect(parseGregorian("334-335 AD")).toBe(334);
    });

    it("parses BC/BCE range and returns negative start year", () => {
      expect(parseGregorian("217-215 BC")).toBe(-217);
      expect(parseGregorian("217-215 BCE")).toBe(-217);
    });

    it("handles abbreviated CE ranges (1507-25 → 1507)", () => {
      expect(parseGregorian("1507-25")).toBe(1507);
    });

    it("handles en-dash in ranges", () => {
      expect(parseGregorian("1507–25")).toBe(1507);
    });

    it("handles em-dash in ranges", () => {
      expect(parseGregorian("1507—25")).toBe(1507);
    });
  });

  describe("qualitative modifiers (circa, after, before)", () => {
    it("parses circa BC year", () => {
      expect(parseGregorian("ca. 100 BC")).toBe(-100);
    });

    it("parses circa AD year", () => {
      expect(parseGregorian("circa 100 AD")).toBe(100);
    });

    it("parses 'c.' notation", () => {
      expect(parseGregorian("c. 50 BC")).toBe(-50);
    });

    it("parses approximate symbol ~", () => {
      expect(parseGregorian("~100 BC")).toBe(-100);
    });

    it("parses 'after' modifier with fractional offset", () => {
      expect(parseGregorian("After 217 BC")).toBe(-216.5);
    });

    it("parses 'before' modifier with fractional offset", () => {
      expect(parseGregorian("Before 217 BC")).toBe(-217.5);
    });

    it("handles case-insensitive modifiers", () => {
      expect(parseGregorian("AFTER 100 BC")).toBe(-99.5);
      expect(parseGregorian("BEFORE 100 BC")).toBe(-100.5);
    });
  });

  describe("complex real-world examples", () => {
    it("handles complex ancient date", () => {
      expect(parseGregorian("ca. 334-331 BC")).toBe(-334);
    });

    it("handles unparseable string", () => {
      expect(parseGregorian("Unknown date")).toBe(Infinity);
    });

    it("handles string with no digits", () => {
      expect(parseGregorian("Ancient")).toBe(Infinity);
    });
  });

  describe("year 0 handling", () => {
    it("parses '0 AD' as year 0", () => {
      expect(parseGregorian("0 AD")).toBe(0);
    });

    it("parses '0 CE' as year 0", () => {
      expect(parseGregorian("0 CE")).toBe(0);
    });

    it("parses '0 BC' as year 0 (astronomical year 0 = 1 BC)", () => {
      expect(parseGregorian("0 BC")).toBe(0);
    });

    it("parses '1 BC' as -1", () => {
      expect(parseGregorian("1 BC")).toBe(-1);
    });

    it("parses '1 CE' as 1", () => {
      expect(parseGregorian("1 CE")).toBe(1);
    });
  });

  describe("structural guard (noise rejection)", () => {
    it("returns Infinity for '10 AM Tuesday'", () => {
      expect(parseGregorian("10 AM Tuesday")).toBe(Infinity);
    });

    it("returns Infinity for 'page 5'", () => {
      expect(parseGregorian("page 5")).toBe(Infinity);
    });

    it("returns Infinity for 'Hour 5'", () => {
      expect(parseGregorian("Hour 5")).toBe(Infinity);
    });

    it("returns Infinity for 'Volume III' (Roman letters, no marker)", () => {
      expect(parseGregorian("Volume III")).toBe(Infinity);
    });

    it("still parses plain 4-digit years without era marker", () => {
      expect(parseGregorian("1066")).toBe(1066);
    });

    it("still parses plain 3-digit years", () => {
      expect(parseGregorian("500")).toBe(500);
    });

    it("still parses plain ranges", () => {
      expect(parseGregorian("100-200")).toBe(100);
    });
  });
});

describe("formatGregorian", () => {
  it("formats positive year as CE", () => {
    expect(formatGregorian(1923)).toBe("1923 CE");
  });

  it("formats negative year as BCE", () => {
    expect(formatGregorian(-217)).toBe("217 BCE");
  });

  it("formats zero as CE", () => {
    expect(formatGregorian(0)).toBe("0 CE");
  });

  it("rounds fractional years", () => {
    expect(formatGregorian(-216.5)).toBe("217 BCE");
    expect(formatGregorian(100.5)).toBe("101 CE");
  });

  it("formats with long style", () => {
    expect(formatGregorian(1923, "long")).toBe("1923 Common Era");
    expect(formatGregorian(-217, "long")).toBe("217 Before Common Era");
  });
});
