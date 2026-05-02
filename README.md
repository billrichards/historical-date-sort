# historical-date-sort

Sort free-form historical date strings across six calendar systems by reducing them to a single IEEE 754 float (astronomical year). Zero runtime dependencies, dual ESM/CJS output, full TypeScript types.

## Install

```sh
npm install historical-date-sort
```

## Quick start

```ts
import { parseHistoricalDate, compareHistoricalDates } from "historical-date-sort";

const records = [
  { id: "A", date: "ca. 450 BCE" },
  { id: "B", date: "AH 150" },       // Islamic Hijri → ~767 CE
  { id: "C", date: "AM 5500" },      // Hebrew Anno Mundi → ~1740 CE
  { id: "D", date: "Meiji 34" },     // Japanese era → 1901 CE
  { id: "E", date: "AUC 754" },      // Roman ab urbe condita → 1 CE
  { id: "F", date: "1921" },
  { id: "G", date: "Unknown date" }, // unparseable → sorts last
];

records.sort((a, b) => compareHistoricalDates(a.date, b.date));
// Result: A (-450), E (1 CE), B (767 CE), C (~1740 CE), D (1901), F (1921), G (last)
```

## API

### `parseHistoricalDate(input, options?): number`

Parses a historical date string and returns an astronomical-year sort key.

- Returns a finite number for successfully parsed dates (negative = BCE/Before Common Era, 0 = year 0, positive = CE).
- Returns `Infinity` for recognized-but-unresolvable inputs (e.g. regnal dates without a resolver, garbled era markers) — these sort last.
- Returns `Infinity` for unrecognized inputs.

```ts
parseHistoricalDate("Meiji 34")           // 1901
parseHistoricalDate("AH 150")             // ≈767.12
parseHistoricalDate("AM 5786")            // 2025
parseHistoricalDate("AUC 754")            // 1
parseHistoricalDate("ca. 450 BCE")        // -450
parseHistoricalDate("49-44 BC")           // -49
parseHistoricalDate("after 217 BC")       // -216.5  (sorts between 217 BC and 216 BC)
parseHistoricalDate("Unknown date")        // Infinity
```

**Options:**

```ts
interface ParseOptions {
  calendars?: CalendarSystem[];      // restrict which plugins run; default: all six
  regnalResolver?: RegnalResolver;   // required for regnal dates
  regnalRuler?: string;              // fallback ruler for bare "regnal year N" inputs
}
```

Throws if `calendars` contains an unknown calendar name (catches typos).

### `compareHistoricalDates(a, b): number`

Drop-in comparator for `Array.prototype.sort`. Handles `null` inputs and `Infinity` results safely — two unparseable values compare as equal (0), not NaN.

```ts
records.sort((a, b) => compareHistoricalDates(a.date, b.date));
```

`null` and unparseable strings always sort after all valid dates.

### `formatHistoricalDate(key, options?): string`

Formats an astronomical-year sort key back to a human-readable string.

```ts
formatHistoricalDate(-450)                           // "450 BCE"
formatHistoricalDate(767.12, { calendar: "islamic" }) // "AH 150"
formatHistoricalDate(2025, { calendar: "hebrew" })    // "AM 5786"
```

### Regnal dates

Regnal year parsing requires a caller-supplied resolver. Without one, regnal patterns return `Infinity` (sorts last) rather than falling through to Gregorian — this prevents `"Year 12 of Henry III"` from silently sorting to 12 CE instead of ~1227 CE.

```ts
import type { RegnalResolver } from "historical-date-sort";

const resolver: RegnalResolver = {
  resolve(ruler: string, regnalYear: number): number | null {
    const accession: Record<string, number> = {
      "Henry III": 1216,
      "Edward I":  1272,
    };
    const start = accession[ruler];
    return start !== undefined ? start + regnalYear - 1 : null;
  },
};

parseHistoricalDate("Year 12 of Henry III", { regnalResolver: resolver }); // 1227
parseHistoricalDate("3rd year of Edward I", { regnalResolver: resolver }); // 1274
parseHistoricalDate("Year 12 of Henry III");                                // Infinity
```

Return `null` from `resolve()` for unknown rulers — the plugin then returns `Infinity`.

## Supported formats

### Gregorian

| Input | Sort key | Notes |
|---|---|---|
| `"1921"` | 1921 | Plain integer |
| `"ca. 450 BCE"` | -450 | `ca.`, `circa`, `c.`, `~`, `≈` all accepted |
| `"450 BC"` | -450 | BC and BCE treated identically |
| `"450 AD"` | 450 | AD and CE treated identically |
| `"49-44 BC"` | -49 | Range → start year |
| `"after 217 BC"` | -216.5 | Sorts between 217 BC and 216 BC |
| `"before 217 BC"` | -217.5 | Sorts between 218 BC and 217 BC |
| `"1 BC"` | -1 | Standard convention |
| `"0 BC"` / `"0 AD"` | 0 | Year 0 (astronomical) |

**Structural guard:** Gregorian is the catch-all fallback and requires the input to contain an era marker (`BC`, `BCE`, `AD`, `CE`), a circa indicator, a plain number, a plain range, or a 4-digit year. Inputs like `"page 5"`, `"Hour 5"`, or `"10 AM Tuesday"` return `Infinity` rather than silently sorting to 5 CE or 10 CE.

### Islamic (Hijri)

| Input | Sort key |
|---|---|
| `"AH 150"` | ≈767.12 |
| `"A.H. 150"` | ≈767.12 |
| `"150 AH"` | ≈767.12 |
| `"Hijri 150"` | ≈767.12 |
| `"Hegira 150"` | ≈767.12 |
| `"150 H"` | ≈767.12 |

Conversion: `CE = AH × 0.9702 + 621.57`

### Hebrew (Anno Mundi)

| Input | Sort key | Notes |
|---|---|---|
| `"AM 5786"` | 2025 | |
| `"5786 AM"` | 2025 | |
| `"A.M. 5786"` | 2025 | |
| `"Anno Mundi 5786"` | 2025 | Case-insensitive |
| `"[5786]"` | 2025 | Bracketed form |
| `"AM5786"` | 2025 | No space |

Conversion: `astro = AM − 3761` (AM 1 → −3760; AM 3761 → 0; AM 5786 → 2025)

**Bracketed form caveat:** `[N]` is only recognized as a Hebrew date when the value is ≥ 4000. Values below 4000 (e.g. `[1923]`) are rejected to avoid false positives with bracketed Gregorian years or editorial notations.

### Roman (Ab Urbe Condita)

| Input | Sort key | Notes |
|---|---|---|
| `"AUC 754"` | 1 | Arabic year |
| `"AUC DCCLIV"` | 1 | Roman numeral year |
| `"A.U.C. 753"` | 0 | AUC 753 = 1 BCE (year 0) |

Conversion: `astro = AUC − 753`

Roman numeral parsing uses round-trip validation (re-encodes result back to canonical form; rejects non-standard notations like `IC`, `XM`, `IL`). Bare Roman numerals without the `AUC` marker are not recognized.

### Japanese (Gengō)

| Input | Sort key | Notes |
|---|---|---|
| `"Meiji 34"` | 1901 | |
| `"Showa 15"` | 1940 | |
| `"Shōwa 15"` | 1940 | Macron variants normalized |
| `"Reiwa 6"` | 2024 | |
| `"Tempo 5"` | 1834 | Romanization variants accepted |

Conversion: `CE = era_start + regnal_year − 1`

The era table covers **Meio (1492) through Reiwa (2019)** — approximately 50 entries covering the Edo period onward. Pre-1492 eras are not included in v1.

### Regnal

| Input | Sort key (with resolver) |
|---|---|
| `"Year 12 of Henry III"` | 1227 |
| `"3rd year of Edward I"` | 1274 |
| `"Henry VIII yr. 12"` | 1520 |
| `"Henry VIII year 12"` | 1520 |
| `"Regnal Year 12 of Henry III"` | 1227 |
| `"regnal year 12"` (with `regnalRuler`) | depends on resolver |

**Without a resolver: returns `Infinity`.** See [Regnal dates](#regnal-dates) above.

### Qualitative modifiers (all calendars)

| Modifier | Effect | Example |
|---|---|---|
| `after X` | +0.5 to sort key | `"after AH 150"` → between AH 150 and AH 151 |
| `before X` | −0.5 to sort key | `"before AH 150"` → between AH 149 and AH 150 |
| `ca. X`, `circa X`, `c. X`, `~X`, `≈X` | no offset | treated as the date itself |

## Tree-shaking

Each calendar system has its own subpath export. Bundlers that support `exports` will tree-shake unused plugins automatically:

```ts
import { parseGregorian } from "historical-date-sort/gregorian";
import { parseIslamic, ahToCE } from "historical-date-sort/islamic";
import { parseHebrew, amToCE } from "historical-date-sort/hebrew";
import { parseRoman, aucToCE, parseRomanNumeral } from "historical-date-sort/roman";
import { parseJapanese, gengoToCE, GENGO } from "historical-date-sort/japanese";
import { parseRegnal } from "historical-date-sort/regnal";
import type { RegnalResolver } from "historical-date-sort/regnal";
```

## Plugin priority

When using the main `parseHistoricalDate` entry point, plugins run in this order — first match wins:

1. **Islamic** — `AH`, `A.H.`, `Hijri`, `Hegira`, digit+`H`
2. **Hebrew** — `AM`, `A.M.`, `Anno Mundi`, bracketed `[N≥4000]`
3. **Japanese** — era name token (`Meiji`, `Showa`, `Reiwa`, …)
4. **Roman** — requires explicit `AUC` / `A.U.C.` marker
5. **Regnal** — `Year N of X`, `X yr. N`, `Nth year of X`, etc.
6. **Gregorian** — catch-all fallback with structural guard

Gregorian runs last deliberately: its digit-extraction regex would otherwise consume strings like `"Meiji 34"` (extracting 34) or `"AH 150"` (extracting 150) instead of delegating to the correct plugin.

## Requirements

- Node.js ≥ 18
- Zero runtime dependencies

## License

MIT
