import { getModOffset, stripModifiers } from "../util/modifiers";
import { parseDigits } from "../util/ranges";
import { parseRomanNumeral, toRomanNumeral } from "../data/roman-numerals";
import type { ParseOptions } from "../types";

export { parseRomanNumeral, toRomanNumeral } from "../data/roman-numerals";

// Require the literal "AUC" marker (with optional periods)
const AUC_RE = /\bA\.?U\.?C\.?\b/i;
// Roman numeral character run
const ROMAN_RUN_RE = /\b([IVXLCDM]+)\b/i;

/** Convert an AUC year to an astronomical CE sort key. */
export function aucToCE(auc: number): number {
  return auc - 753;
}

/** Internal plugin interface. Returns null if input lacks an AUC marker. */
export function parseRomanPlugin(s: string, _options?: ParseOptions): number | null {
  if (!AUC_RE.test(s)) return null;

  const modOffset = getModOffset(s);

  const core = stripModifiers(s)
    .replace(/\bA\.?U\.?C\.?\b/gi, "")
    .trim();

  // Try Arabic numerals (handles both ranges and single years)
  const arabicParsed = parseDigits(core);
  if (arabicParsed) {
    return aucToCE(arabicParsed.start) + modOffset;
  }

  // Try Roman numeral character run
  const romanMatch = core.match(ROMAN_RUN_RE);
  if (romanMatch) {
    const auc = parseRomanNumeral(romanMatch[1].toUpperCase());
    if (auc === null) return Infinity; // AUC marker present but numeral is malformed
    return aucToCE(auc) + modOffset;
  }

  return Infinity; // AUC marker present but no parseable year
}

/** Public entry point. Accepts any input; returns Infinity for non-AUC or garbled. */
export function parseRoman(input: string | null | undefined): number {
  if (!input) return Infinity;
  const s = input.trim();
  if (!s) return Infinity;
  const result = parseRomanPlugin(s);
  return result === null ? Infinity : result;
}

/** Format an astronomical key as an AUC string. */
export function formatRoman(key: number, style: "short" | "long" = "short"): string {
  const auc = Math.round(key) + 753;
  if (style === "long") {
    const roman = toRomanNumeral(auc);
    return roman ? `${roman} AUC (${auc} AUC)` : `${auc} AUC`;
  }
  return `${auc} AUC`;
}
