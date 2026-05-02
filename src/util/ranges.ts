const RANGE_RE = /^(\d+)\s*[-–—]\s*(\d+)$/;
const DIGIT_RE = /(\d+)/;

export interface ParsedDigits {
  start: number;
  startStr: string;
  endStr: string | null;
}

/**
 * Extract the first year (or start of a range) from a stripped core string.
 * Returns null if no digits are found.
 */
export function parseDigits(core: string): ParsedDigits | null {
  const rangeMatch = core.match(RANGE_RE);
  if (rangeMatch) {
    return {
      start: parseInt(rangeMatch[1], 10),
      startStr: rangeMatch[1],
      endStr: rangeMatch[2],
    };
  }
  const singleMatch = core.match(DIGIT_RE);
  if (singleMatch) {
    return {
      start: parseInt(singleMatch[1], 10),
      startStr: singleMatch[1],
      endStr: null,
    };
  }
  return null;
}
