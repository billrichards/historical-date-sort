export type CalendarSystem =
  | "gregorian"
  | "islamic"
  | "hebrew"
  | "roman"
  | "japanese"
  | "regnal";

export interface RegnalResolver {
  /**
   * Given a ruler name as it appears in the input and a 1-based regnal year,
   * return the astronomical CE sort key for that year, or null if unknown.
   */
  resolve(ruler: string, regnalYear: number): number | null;
}

export interface ParseOptions {
  /** Restrict which calendar plugins are attempted. Default: all six. */
  calendars?: CalendarSystem[];
  /** Resolver for regnal year → astronomical CE conversion. */
  regnalResolver?: RegnalResolver;
  /** Fallback ruler name for bare "regnal year N" inputs. */
  regnalRuler?: string;
}

export interface FormatOptions {
  /** Calendar system to format in. Default: "gregorian". */
  calendar?: CalendarSystem;
  /** "short" (default): "217 BCE" | "long": "217 Before Common Era" */
  style?: "short" | "long";
}

export interface CalendarPlugin {
  readonly name: CalendarSystem;
  /**
   * Returns:
   *  - finite number: parsed astronomical-year sort key
   *  - Infinity: recognized this calendar's marker, but year is missing/garbled
   *  - null: this input does not belong to this calendar; try the next plugin
   */
  parse(input: string, options?: ParseOptions): number | null;
}
