# Performance Budget Contract

## Targets
- Home route:
  - HTML raw target: `< 110 KB`
  - Initial JS gzip target: `< 180 KB`
- Project routes:
  - HTML raw target: `< 140 KB` (warn)
  - Initial JS gzip target: `< 240 KB` (warn)

## Hard Caps
- Home route:
  - HTML raw hard cap: `140 KB`
  - Initial JS gzip hard cap: `240 KB`
- Project routes:
  - HTML raw hard cap: `260 KB`
  - Initial JS gzip hard cap: `340 KB`

## Enforcement Commands
- Baseline check (warn + report):
  - `npm run perf:check`
- Strict fail on hard-cap regressions:
  - `npm run perf:check:strict`
- Strict fail on warn and hard regressions:
  - `node scripts/perf/check_route_budgets.mjs --strict-warn`

## Measurement Source
- HTML artifacts from `.next/server/app/*.html`.
- Inferred initial JS from script references in route HTML, measured as gzip bytes.

## Design Implications
- Heavy chart modules must remain behind `LazyInteractiveGate`.
- Do not load maps/webgl above the fold.
- Avoid autoplay hero video at first paint.
