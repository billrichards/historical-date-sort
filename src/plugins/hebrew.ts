import { getModOffset, stripModifiers } from "../util/modifiers";
import { parseDigits } from "../util/ranges";
import type { ParseOptions } from "../types";

// AM then any digit(s) — "10 AM Tuesday" is safe because AM is not followed by digits there
const AM_BEFORE_RE = /\bA\.?M\.?\s*\d+\b/i;       // "AM 5786", "AM 1", "A.M. 5786"
// Digits before AM — keep 4-5 digit guard to avoid "5 AM" false positives
const AM_AFTER_RE  = /\b\d{4,5}\s*A\.?M\.?\b/i;  // "5786 AM"
const ANNO_MUNDI_RE = /\banno\s+mundi\b/i;
// Bracketed form "[5786]" — must be the entire string, value must be ≥ 4000
const BRACKET_RE = /^\[\s*(\d{4,5})\s*\]$/;

function looksLikeAM(s: string): boolean {
  if (ANNO_MUNDI_RE.test(s)) return true;
  if (AM_BEFORE_RE.test(s) || AM_AFTER_RE.test(s)) return true;
  const bm = s.trim().match(BRACKET_RE);
  if (bm && parseInt(bm[1], 10) >= 4000) return true;
  return false;
}

/** Convert an AM (Anno Mundi) year to an astronomical CE sort key. */
export function amToCE(am: number): number {
  return am - 3761;
}

/** Internal plugin interface. Returns null if input is not Hebrew calendar. */
export function parseHebrewPlugin(s: string, _options?: ParseOptions): number | null {
  if (!looksLikeAM(s)) return null;

  // Bracketed form: entire string is "[NNNN]"
  const bm = s.trim().match(BRACKET_RE);
  if (bm) {
    const am = parseInt(bm[1], 10);
    if (am < 4000) return null; // guard — already checked in looksLikeAM but be explicit
    return amToCE(am) + getModOffset(s);
  }

  const modOffset = getModOffset(s);

  const core = stripModifiers(s)
    .replace(/\banno\s+mundi\b/gi, "")
    .replace(/\bA\.M\.\s*/gi, "")  // "A.M. " form
    .replace(/\bA\.M\b/gi, "")     // "A.M" form
    .replace(/\bAM(?=\d)/gi, "")   // "AM5786" (no space)
    .replace(/\bAM\b/gi, "")       // "AM 5786" (space or end)
    .replace(/[\[\]]/g, "")
    .trim();

  const parsed = parseDigits(core);
  if (!parsed) return Infinity;

  return amToCE(parsed.start) + modOffset;
}

/** Public entry point. Accepts any input; returns Infinity for non-Hebrew or garbled. */
export function parseHebrew(input: string | null | undefined): number {
  if (!input) return Infinity;
  const s = input.trim();
  if (!s) return Infinity;
  const result = parseHebrewPlugin(s);
  return result === null ? Infinity : result;
}

/** Format an astronomical key as an AM string. */
export function formatHebrew(key: number, style: "short" | "long" = "short"): string {
  const am = Math.round(key) + 3761;
  const marker = style === "long" ? "Anno Mundi" : "AM";
  return `${marker} ${am}`;
}
