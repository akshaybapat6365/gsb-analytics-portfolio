# Open-Only Data Pipeline Contract

## Objective
Run all six projects on a reproducible open-data workflow with:
1. source discovery manifests
2. parallel enrichment runs
3. per-project quality scoring and ranking

## Commands
1. `npm run data:discover`
2. `npm run data:build:open`
3. `npm run data:quality`
4. `npm run data:refresh:open` (all-in-one)

## Storage Contract
- `data/raw/<project>/<signal>/<runId>.json`
- `data/processed/<project>/real_signals_<runId>.json`
- `data/provenance/<project>/sources.json`
- `data/provenance/<project>/runs/<runId>.json`
- `data/quality/<project>/quality_report.json`
- `data/quality/rankings.json`

## Quality Scoring (0-100)
Components:
1. `coverage`: required-signal status quality (`ok` > `stale` > `unavailable`)
2. `freshness`: recency from `asOf` / `fetchedAt`
3. `modelDepth`: project-specific payload depth checks
4. `provenance`: completeness of source metadata
5. `openDataAvailability`: average openness score from source catalog

Final score:
- `0.75 * weightedQuality + 0.25 * openDataAvailability`
- `weightedQuality` uses project-specific rubric weights from `scripts/python/open_data_catalog.py`

## Execution Mode
- Parallel worker model (default 6 workers) at project level.
- Failure-tolerant: one project failure does not suppress successful artifacts for others.
- All failures are persisted in run summary at `public/data/_runs/<runId>.json`.
