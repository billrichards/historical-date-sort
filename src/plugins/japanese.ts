import { getModOffset, stripModifiers } from "../util/modifiers";
import { GENGO } from "../data/gengo";
import type { ParseOptions } from "../types";

export { GENGO } from "../data/gengo";

// Build era-name alternation, sorted by length descending to avoid partial matches
const ERA_NAMES = Object.keys(GENGO).sort((a, b) => b.length - a.length);
const ERA_PATTERN = ERA_NAMES.join("|");
// "Meiji 34" — era name followed by 1–3 digits (not 4+ to avoid "1923" misread)
const ERA_YEAR_RE = new RegExp(`\\b(${ERA_PATTERN})\\b\\s*(\\d{1,3})(?!\\d)`, "i");
// "34 Meiji" — reverse form (uncommon but valid)
const YEAR_ERA_RE = new RegExp(`\\b(\\d{1,3})(?!\\d)\\s*\\b(${ERA_PATTERN})\\b`, "i");

/** Strip diacritical marks (macrons, etc.) so Shōwa → Showa. */
function normalizeMacrons(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/** Convert era name + regnal year to astronomical CE sort key. */
export function gengoToCE(eraName: string, regYear: number): number | null {
  const norm = normalizeMacrons(eraName).toLowerCase();
  const key = Object.keys(GENGO).find(k => k.toLowerCase() === norm);
  if (!key) return null;
  return GENGO[key] + regYear - 1;
}

/** Internal plugin interface. Returns null if input contains no recognized era name. */
export function parseJapanesePlugin(s: string, _options?: ParseOptions): number | null {
  const normalized = normalizeMacrons(s);
  const modOffset = getModOffset(s);
  const stripped = stripModifiers(normalized);

  let eraName: string;
  let regYear: number;

  const m1 = stripped.match(ERA_YEAR_RE);
  if (m1) {
    eraName = m1[1];
    regYear = parseInt(m1[2], 10);
  } else {
    const m2 = stripped.match(YEAR_ERA_RE);
    if (!m2) return null;
    regYear = parseInt(m2[1], 10);
    eraName = m2[2];
  }

  if (regYear < 1) return Infinity;

  const ce = gengoToCE(eraName, regYear);
  if (ce === null) return null; // era token in string but not in table
  return ce + modOffset;
}

/** Public entry point. Accepts any input; returns Infinity for non-Japanese or garbled. */
export function parseJapanese(input: string | null | undefined): number {
  if (!input) return Infinity;
  const s = input.trim();
  if (!s) return Infinity;
  const result = parseJapanesePlugin(s);
  return result === null ? Infinity : result;
}

/** Format an astronomical key as a gengō string. */
export function formatJapanese(key: number, style: "short" | "long" = "short"): string {
  const year = Math.round(key);
  // Find the era with the largest start year ≤ target year
  const sortedEras = Object.entries(GENGO).sort(([, a], [, b]) => b - a);
  const found = sortedEras.find(([, start]) => start <= year);
  if (!found) {
    const n = Math.abs(year);
    return year < 0 ? `${n} BCE` : `${year} CE`;
  }
  const [eraName, start] = found;
  const regYear = year - start + 1;
  return style === "long" ? `${eraName} year ${regYear}` : `${eraName} ${regYear}`;
}
