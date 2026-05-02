# Changelog

## [1.0.0] - 2025-05-02

### Added
- Initial release
- Gregorian (BC/BCE/AD/CE) calendar support with qualitative modifiers (circa, after, before)
- Islamic (AH/Hijri) calendar support
- Hebrew (AM/Anno Mundi) calendar support with square-bracket notation
- Roman (AUC) calendar support with Arabic and Roman numeral year parsing
- Japanese imperial era (gengō) support with macron normalization
- Regnal year parser with caller-supplied resolver interface
- `parseHistoricalDate` orchestrator with six-plugin priority system
- `compareHistoricalDates` comparator for Array.sort (Infinity-safe)
- `formatHistoricalDate` for display formatting per calendar
- Per-plugin subpath exports for tree-shaking
- Zero runtime dependencies
