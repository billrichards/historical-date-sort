import { getModOffset, stripModifiers } from "../util/modifiers";
import { parseDigits } from "../util/ranges";
import type { ParseOptions } from "../types";

// AH word-boundary forms: AH, A.H, A.H.
const AH_WORD_RE = /\bAH\b|A\.H\b|A\.H\./i;
// AH directly followed by digits (no space): "AH150"
const AH_NOSPACE_RE = /\bAH\d/i;
// Hijri / Hejira / Hegira
const HIJRI_RE = /\bHijri\b|\bHe[gj]ira\b/i;
// Lone H suffix after digits with whitespace: "150 H" — not "5H pencil"
const H_SUFFIX_RE = /\b\d+\s+H\b(?!\w)/;

function looksLikeAH(s: string): boolean {
  return AH_WORD_RE.test(s)
      || AH_NOSPACE_RE.test(s)
      || HIJRI_RE.test(s)
      || H_SUFFIX_RE.test(s);
}

/** Convert an AH year to an approximate astronomical CE sort key. */
export function ahToCE(ah: number): number {
  return ah * 0.9702 + 621.57;
}

/** Internal plugin interface. Returns null if input is not Islamic-calendar. */
export function parseIslamicPlugin(s: string, _options?: ParseOptions): number | null {
  if (!looksLikeAH(s)) return null;

  const modOffset = getModOffset(s);

  // Strip markers then extract year
  const core = stripModifiers(s)
    .replace(/\bA\.H\./gi, "")     // "A.H." form first (longer match)
    .replace(/\bA\.H\b/gi, "")     // "A.H" form
    .replace(/\bAH\b/gi, "")       // "AH" form
    .replace(/\bAH(?=\d)/gi, "")   // "AH150" (no space)
    .replace(/\bHijri\b/gi, "")
    .replace(/\bHe[gj]ira\b/gi, "")
    .replace(/\b(\d+)\s+H\b(?!\w)/g, "$1")  // "150 H" → "150"
    .trim();

  const parsed = parseDigits(core);
  if (!parsed) return Infinity; // marker matched but no year

  return ahToCE(parsed.start) + modOffset;
}

/** Public entry point. Accepts any input; returns Infinity for non-Islamic or garbled. */
export function parseIslamic(input: string | null | undefined): number {
  if (!input) return Infinity;
  const s = input.trim();
  if (!s) return Infinity;
  const result = parseIslamicPlugin(s);
  return result === null ? Infinity : result;
}

/** Format an astronomical key as an AH string. */
export function formatIslamic(key: number, style: "short" | "long" = "short"): string {
  const ah = Math.round((key - 621.57) / 0.9702);
  const marker = style === "long" ? "Anno Hegirae" : "AH";
  return `${marker} ${ah}`;
}
