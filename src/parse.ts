import type { CalendarPlugin, CalendarSystem, ParseOptions } from "./types";
import { parseGregorianPlugin } from "./plugins/gregorian";
import { parseIslamicPlugin } from "./plugins/islamic";
import { parseHebrewPlugin } from "./plugins/hebrew";
import { parseJapanesePlugin } from "./plugins/japanese";
import { parseRomanPlugin } from "./plugins/roman";
import { parseRegnalPlugin } from "./plugins/regnal";

const PLUGINS: Record<CalendarSystem, CalendarPlugin["parse"]> = {
  islamic:   parseIslamicPlugin,
  hebrew:    parseHebrewPlugin,
  japanese:  parseJapanesePlugin,
  roman:     parseRomanPlugin,
  regnal:    parseRegnalPlugin,
  gregorian: parseGregorianPlugin,
};

const DEFAULT_ORDER: CalendarSystem[] = [
  "islamic",
  "hebrew",
  "japanese",
  "roman",
  "regnal",
  "gregorian",
];

const VALID_CALENDARS = new Set<CalendarSystem>(DEFAULT_ORDER);

function resolveCalendars(calendars?: CalendarSystem[]): CalendarSystem[] {
  if (!calendars) return DEFAULT_ORDER;
  for (const c of calendars) {
    if (!VALID_CALENDARS.has(c)) {
      throw new Error(
        `Unknown calendar: "${c}". Valid values: ${DEFAULT_ORDER.join(", ")}`
      );
    }
  }
  return DEFAULT_ORDER.filter(c => calendars.includes(c));
}

/**
 * Parse a free-form historical date string to an astronomical sort key.
 *
 * Tries each enabled calendar plugin in priority order:
 *   islamic → hebrew → japanese → roman → regnal → gregorian
 *
 * The first plugin that recognizes the input wins. Returns Infinity for
 * strings that no plugin can interpret.
 */
export function parseHistoricalDate(
  input: string | null | undefined,
  options?: ParseOptions
): number {
  if (!input) return Infinity;
  const s = input.trim();
  if (!s) return Infinity;

  const order = resolveCalendars(options?.calendars);
  for (const name of order) {
    const result = PLUGINS[name](s, options);
    if (result !== null) return result;
  }
  return Infinity;
}
