const VALUES: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};

const CANONICAL_PAIRS: [number, string][] = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

const INVALID_REPEATS = /IIII|XXXX|CCCC|MMMM|VV|LL|DD/;

export function toRomanNumeral(n: number): string {
  if (n < 1 || n > 3999) return "";
  let out = "";
  let rem = n;
  for (const [v, r] of CANONICAL_PAIRS) {
    while (rem >= v) { out += r; rem -= v; }
  }
  return out;
}

/**
 * Parse an uppercase Roman numeral string to an integer.
 * Returns null for empty input, invalid characters, non-subtractive forms (IIII, IC),
 * or values outside 1–3999.
 */
export function parseRomanNumeral(roman: string): number | null {
  if (!roman || !/^[IVXLCDM]+$/.test(roman)) return null;
  if (INVALID_REPEATS.test(roman)) return null;

  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const cur = VALUES[roman[i]];
    const next = VALUES[roman[i + 1]];
    if (next !== undefined && cur < next) {
      total += next - cur;
      i++;
    } else {
      total += cur;
    }
  }

  if (total < 1 || total > 3999) return null;
  // Round-trip validation rejects non-canonical forms like IC, XM, IL
  if (toRomanNumeral(total) !== roman) return null;

  return total;
}
