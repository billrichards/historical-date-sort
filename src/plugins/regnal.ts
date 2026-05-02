import { getModOffset, stripModifiers } from "../util/modifiers";
import type { ParseOptions, RegnalResolver } from "../types";

export type { RegnalResolver } from "../types";

interface MatchedRegnal {
  ruler: string | null;
  regnalYear: number;
}

const PATTERNS: Array<{
  re: RegExp;
  extract(m: RegExpMatchArray): MatchedRegnal;
}> = [
  // "Year N of Ruler" / "Regnal Year N of Ruler"
  {
    re: /^(?:regnal\s+)?year\s+(\d{1,3})\s+of\s+(.+)$/i,
    extract: m => ({ regnalYear: parseInt(m[1], 10), ruler: m[2].trim() }),
  },
  // "Nth year of Ruler"
  {
    re: /^(\d{1,3})(?:st|nd|rd|th)\s+year\s+of\s+(.+)$/i,
    extract: m => ({ regnalYear: parseInt(m[1], 10), ruler: m[2].trim() }),
  },
  // "Regnal year N" — no ruler name; caller must supply regnalRuler via options
  // Must come BEFORE "Ruler year N" or "regnal" would be captured as a ruler name
  {
    re: /^regnal\s+year\s+(\d{1,3})$/i,
    extract: m => ({ regnalYear: parseInt(m[1], 10), ruler: null }),
  },
  // "Ruler yr. N" / "Ruler yr N"
  {
    re: /^(.+?)\s+yr\.?\s+(\d{1,3})$/i,
    extract: m => ({ ruler: m[1].trim(), regnalYear: parseInt(m[2], 10) }),
  },
  // "Ruler year N"
  {
    re: /^(.+?)\s+year\s+(\d{1,3})$/i,
    extract: m => ({ ruler: m[1].trim(), regnalYear: parseInt(m[2], 10) }),
  },
];

function matchRegnal(s: string): MatchedRegnal | null {
  for (const { re, extract } of PATTERNS) {
    const m = s.match(re);
    if (m) return extract(m);
  }
  return null;
}

/**
 * Internal plugin interface. Returns null if no regnal pattern matches.
 *
 * When a pattern IS matched but the input cannot be resolved (missing resolver,
 * unknown ruler, etc.), returns Infinity rather than null — this prevents
 * Gregorian from extracting a misleading year from a recognized regnal string.
 */
export function parseRegnalPlugin(s: string, options?: ParseOptions): number | null {
  const stripped = stripModifiers(s).trim();
  const match = matchRegnal(stripped);
  if (!match) return null;

  const { ruler, regnalYear } = match;
  if (regnalYear < 1) return Infinity;

  const effectiveRuler = ruler ?? options?.regnalRuler ?? null;
  if (!effectiveRuler) return Infinity;

  const resolver: RegnalResolver | undefined = options?.regnalResolver;
  if (!resolver) return Infinity;

  const ce = resolver.resolve(effectiveRuler, regnalYear);
  if (ce === null) return Infinity;

  return ce + getModOffset(s);
}

/** Public entry point. Accepts any input; returns Infinity without a resolver. */
export function parseRegnal(
  input: string | null | undefined,
  options?: ParseOptions
): number {
  if (!input) return Infinity;
  const s = input.trim();
  if (!s) return Infinity;
  const result = parseRegnalPlugin(s, options);
  return result === null ? Infinity : result;
}
