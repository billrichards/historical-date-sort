const MOD_DETECT_RE = /\b(after|before)\b/i;
// Use lookahead (?=\s|$) instead of trailing \b so "ca." is consumed with its dot
const MOD_STRIP_RE = /\b(?:after|before|circa|ca\.?|c\.)(?=\s|$)/gi;
const SYMBOL_STRIP_RE = /[~≈]/g;

/** Return +0.5 for "after", -0.5 for "before", 0 otherwise. */
export function getModOffset(s: string): number {
  const m = MOD_DETECT_RE.exec(s);
  if (!m) return 0;
  return m[1].toLowerCase() === "after" ? 0.5 : -0.5;
}

/** Strip qualitative modifiers and approximation symbols (not era markers). */
export function stripModifiers(s: string): string {
  return s.replace(MOD_STRIP_RE, "").replace(SYMBOL_STRIP_RE, "").trim();
}
