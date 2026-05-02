import { parseHistoricalDate } from "./parse";
import type { ParseOptions } from "./types";

/**
 * Comparator for Array.sort that orders historical date strings chronologically.
 * Strings that cannot be parsed sort last (Infinity).
 * Two unparseable strings compare as equal (returns 0).
 */
export function compareHistoricalDates(
  a: string | null | undefined,
  b: string | null | undefined,
  options?: ParseOptions
): number {
  const ka = parseHistoricalDate(a, options);
  const kb = parseHistoricalDate(b, options);
  if (ka === Infinity && kb === Infinity) return 0;
  if (ka === Infinity) return 1;
  if (kb === Infinity) return -1;
  return ka - kb;
}
