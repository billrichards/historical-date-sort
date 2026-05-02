import { getModOffset, stripModifiers } from "../util/modifiers";
import { parseDigits } from "../util/ranges";
import type { ParseOptions } from "../types";

const BCE_RE = /\b(BC|BCE)\b/i;
const ERA_RE = /\b(BC|BCE|AD|CE)\b/i;
// Detect circa without requiring a trailing word-boundary (handles "c.")
const CIRCA_RE = /\b(?:circa|ca?\.?|c\.)|[~≈]/i;
const PLAIN_NUM_RE = /^\d+$/;
const PLAIN_RANGE_RE = /^\d+\s*[-–—]\s*\d+$/;
const FOUR_DIGIT_RE = /\b\d{4}\b/;

/** Internal plugin — Gregorian is always the catch-all; never returns null. */
export function parseGregorianPlugin(s: string, _options?: ParseOptions): number | null {
  return parseGregorian(s);
}

/**
 * Parse a Gregorian-style historical date string to an astronomical sort key.
 *
 * Returns Infinity for strings that contain no structural date signal
 * (no era marker, no circa indicator, not a plain number or 4-digit year).
 * This prevents arbitrary text with incidental digits from getting a sort key.
 */
export function parseGregorian(input: string | null | undefined): number {
  if (!input) return Infinity;
  const s = input.trim();
  if (!s) return Infinity;

  const isBCE = BCE_RE.test(s);
  const modOffset = getModOffset(s);

  const core = stripModifiers(s)
    .replace(/\b(BC|BCE|AD|CE)\b/gi, "")
    .trim();

  // Structural guard: require a recognizable date signal
  const hasEra = ERA_RE.test(s);
  const hasCirca = CIRCA_RE.test(s);
  const isPlainNumber = PLAIN_NUM_RE.test(core);
  const isPlainRange = PLAIN_RANGE_RE.test(core);
  const has4DigitYear = FOUR_DIGIT_RE.test(s);
  if (!hasEra && !hasCirca && !isPlainNumber && !isPlainRange && !has4DigitYear) {
    return Infinity;
  }

  const parsed = parseDigits(core);
  if (!parsed) return Infinity;

  const year = parsed.start;
  // (-year || 0) normalizes -0 to 0 for "0 BC" / "0 AD"
  const key = isBCE ? (-year || 0) : year;
  return key + modOffset;
}

/** Format an astronomical year key as a Gregorian display string. */
export function formatGregorian(key: number, style: "short" | "long" = "short"): string {
  const n = Math.round(Math.abs(key));
  const era = key < 0
    ? (style === "long" ? "Before Common Era" : "BCE")
    : (style === "long" ? "Common Era" : "CE");
  return `${n} ${era}`;
}
