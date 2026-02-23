# Typography Contract

## Global Stack
- `font-display`: `Instrument Serif`
- `font-sans` (UI + body): `Instrument Sans`
- `font-mono` (metrics, axes, chips): `IBM Plex Mono`

## Rules
1. Route body copy must use `font-sans`.
2. Data readouts, chart labels, and numeric rails must use `font-mono`.
3. Display serif usage is restricted to hero or chapter headlines.
4. Do not introduce `Inter`, `Arial`, `Roboto`, or system-default body stacks.
5. Route-level font overrides must still retain Instrument Serif presence for brand continuity.

## Enforcement
- `app/layout.tsx` is the global source of truth for loaded font families.
- Classes should resolve through Tailwind utility classes, not inline `font-family` strings.
- Visual QA gate checks:
  - home hero headline uses `font-display`
  - KPI labels and chart legends use `font-mono`
  - body paragraphs use `font-sans`
