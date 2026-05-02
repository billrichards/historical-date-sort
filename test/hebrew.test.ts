import { describe, it, expect } from "vitest";
import { parseHebrew, parseHebrewPlugin, amToCE } from "../src/plugins/hebrew";

describe("parseHebrew", () => {
  describe("typical AM inputs", () => {
    it("parses 'AM 5000'", () => {
      expect(parseHebrew("AM 5000")).toBe(amToCE(5000));
    });

    it("parses '5000 AM'", () => {
      expect(parseHebrew("5000 AM")).toBe(amToCE(5000));
    });

    it("parses 'A.M. 5786'", () => {
      expect(parseHebrew("A.M. 5786")).toBe(amToCE(5786));
    });

    it("parses 'anno mundi 5786' (lowercase)", () => {
      expect(parseHebrew("anno mundi 5786")).toBe(amToCE(5786));
    });

    it("parses 'Anno Mundi 5786'", () => {
      expect(parseHebrew("Anno Mundi 5786")).toBe(amToCE(5786));
    });

    it("parses 'ANNO MUNDI 5786' (uppercase)", () => {
      expect(parseHebrew("ANNO MUNDI 5786")).toBe(amToCE(5786));
    });

    it("parses '[5786]' (bracketed form)", () => {
      expect(parseHebrew("[5786]")).toBe(amToCE(5786));
    });

    it("parses '[ 5786 ]' (whitespace inside brackets)", () => {
      expect(parseHebrew("[ 5786 ]")).toBe(amToCE(5786));
    });

    it("parses 'AM5786' (no space)", () => {
      expect(parseHebrew("AM5786")).toBe(amToCE(5786));
    });
  });

  describe("anchor sanity checks", () => {
    it("AM 1 → astronomical year -3760", () => {
      expect(parseHebrew("AM 1")).toBe(-3760);
    });

    it("AM 3761 → astronomical year 0", () => {
      expect(parseHebrew("AM 3761")).toBe(0);
    });

    it("AM 5786 → CE 2025", () => {
      expect(parseHebrew("AM 5786")).toBe(2025);
    });
  });

  describe("ranges", () => {
    it("parses 'AM 5780-5786' and returns start", () => {
      expect(parseHebrew("AM 5780-5786")).toBe(amToCE(5780));
    });

    it("handles en-dash range", () => {
      expect(parseHebrew("AM 5780–5786")).toBe(amToCE(5780));
    });
  });

  describe("qualitative modifiers", () => {
    it("parses 'ca. AM 5500'", () => {
      expect(parseHebrew("ca. AM 5500")).toBe(amToCE(5500));
    });

    it("after AM 5000 adds +0.5", () => {
      expect(parseHebrew("after AM 5000")).toBe(amToCE(5000) + 0.5);
    });

    it("before AM 5000 adds -0.5", () => {
      expect(parseHebrew("before AM 5000")).toBe(amToCE(5000) - 0.5);
    });
  });

  describe("false-positive guards (must return null from plugin)", () => {
    it("rejects '10 AM Tuesday'", () => {
      expect(parseHebrewPlugin("10 AM Tuesday")).toBeNull();
    });

    it("rejects '5 AM' (only 1 digit, not 4+)", () => {
      expect(parseHebrewPlugin("5 AM")).toBeNull();
    });

    it("rejects '[1923]' (value < 4000)", () => {
      expect(parseHebrewPlugin("[1923]")).toBeNull();
    });

    it("rejects '[ca. 50 BC]' (non-numeric bracket content)", () => {
      expect(parseHebrewPlugin("[ca. 50 BC]")).toBeNull();
    });

    it("rejects 'AH 150'", () => {
      expect(parseHebrewPlugin("AH 150")).toBeNull();
    });

    it("rejects 'AUC 754'", () => {
      expect(parseHebrewPlugin("AUC 754")).toBeNull();
    });

    it("rejects plain '1923'", () => {
      expect(parseHebrewPlugin("1923")).toBeNull();
    });
  });

  describe("mine but garbled (Infinity, not null)", () => {
    it("'Anno Mundi' with no number returns Infinity", () => {
      expect(parseHebrewPlugin("Anno Mundi")).toBe(Infinity);
    });

    it("'AM xxxx' (non-numeric) returns null — no digit adjacent to AM, treated as not-mine", () => {
      expect(parseHebrewPlugin("AM xxxx")).toBeNull();
    });
  });

  describe("null/undefined/empty", () => {
    it("returns Infinity for null", () => {
      expect(parseHebrew(null)).toBe(Infinity);
    });

    it("returns Infinity for undefined", () => {
      expect(parseHebrew(undefined)).toBe(Infinity);
    });

    it("returns Infinity for empty string", () => {
      expect(parseHebrew("")).toBe(Infinity);
    });
  });
});
