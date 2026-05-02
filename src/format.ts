import type { FormatOptions } from "./types";
import { formatGregorian } from "./plugins/gregorian";
import { formatIslamic } from "./plugins/islamic";
import { formatHebrew } from "./plugins/hebrew";
import { formatRoman } from "./plugins/roman";
import { formatJapanese } from "./plugins/japanese";

/**
 * Format an astronomical sort key as a human-readable date string.
 * Defaults to Gregorian format ("217 BCE", "1923 CE").
 */
export function formatHistoricalDate(
  key: number,
  options?: FormatOptions
): string {
  const calendar = options?.calendar ?? "gregorian";
  const style = options?.style ?? "short";

  switch (calendar) {
    case "islamic":  return formatIslamic(key, style);
    case "hebrew":   return formatHebrew(key, style);
    case "roman":    return formatRoman(key, style);
    case "japanese": return formatJapanese(key, style);
    case "gregorian":
    case "regnal":   // regnal has no meaningful inverse; fall back to Gregorian
    default:         return formatGregorian(key, style);
  }
}
