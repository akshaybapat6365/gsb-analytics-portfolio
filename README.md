# GSB Decision Intelligence Portfolio

Next.js (App Router) portfolio with 6 interactive “war-room” dashboards:
- Reinforcement learning pricing simulator (ORD–LGA)
- Fraud early-warning radar (filings + language signals)
- Shrink/loss prevention ROI simulator (Bayesian stop rule)
- Remote work geo-analytics (Denver case study)
- EV charging network war game (I-5 corridor)
- Content ROI autopsy + greenlight tool (Netflix)

## Stack
- Next.js + TypeScript
- Tailwind CSS
- Framer Motion
- Apache ECharts + deck.gl (MapLibre)
- Offline data/model pipeline exporting static JSON into `public/data/**`

Project-specific typography via `next/font/google`:
- ORD-LGA: Playfair Display + DM Sans
- Fraud: Crimson Pro + Space Grotesk
- Target Shrink: Oswald + Inter
- Starbucks Pivot: Lora + Source Sans 3
- Tesla NACS: Rajdhani + Outfit
- Netflix ROI: Merriweather + Nunito Sans
- Shared mono: IBM Plex Mono

## Prereqs
- Node: `20.x` (recommended). Repo includes `.nvmrc` and `package.json#engines`.

Quick check:
```bash
npm run env:check
```

Optional dev overlay diagnostics:
```bash
export NEXT_PUBLIC_SHOW_PERF_DIAGNOSTICS=1
```

## Run
```bash
cd ~/gsb-analytics-portfolio
npm install
npm run env:check
npm run dev
```

The server prints `OPEN_THIS_URL=http://localhost:<port>`.

If `npm run dev` fails with `ERR_CONNECTION_REFUSED`, run:
```bash
npm run dev:doctor
```

If needed, run a deterministic fixed-port command:
```bash
PORT=3401 npm run dev
# alias
npm run dev:port
```

If something else is on the port:
```bash
lsof -nP -iTCP:3401 -sTCP:LISTEN
lsof -nP -iTCP:3402 -sTCP:LISTEN
lsof -nP -iTCP:3403 -sTCP:LISTEN
```

To auto-start and open browser (macOS):
```bash
scripts/dev/open.sh
```

If Node is wrong:
```bash
nvm use 20
npm run dev
```

### Runtime Data Policy
The UI and payload pipeline support three explicit modes:
- `strict-real`
- `baseline-fallback` (default)
- `synthetic-demo`

Set mode in local dev with:
```bash
export NEXT_PUBLIC_DATA_POLICY_MODE=baseline-fallback
```

## Generate Data (Synthetic)
The site ships with synthetic payloads already committed under `public/data/**`.

To regenerate:
```bash
npm run data:build
```

To discover open sources and generate per-project source manifests:
```bash
npm run data:discover
```

To run open-data enrichment in parallel (6 workers by default):
```bash
npm run data:build:open
```
This mode preserves the current payload as stale-cache input for stricter resilience.

To force a fresh synthetic rebuild before open-data enrichment:
```bash
npm run data:build:open:fresh
```

To score/rank open-data quality across all six projects:
```bash
npm run data:quality
```

To run full open-only refresh end-to-end:
```bash
npm run data:refresh:open
```

To run Project 1 (ORD-LGA) research diagnostics directly:
```bash
npm run airline:fit-baselines
npm run airline:fit-policy
npm run airline:ablation
npm run airline:sensitivity
npm run airline:research-tables
# or all:
npm run airline:research
```

To enrich all projects with strict real-only partial coverage metadata/signals (legacy single-process path):
```bash
npm run data:build:real
```

`data:build:real` will never synthesize missing real feed values. Missing sources are marked `unavailable`
in `payload.meta.modules` and `payload.realSignals`.
It also writes run health files to:
- `public/data/_health.json`
- `public/data/_runs/<runId>.json`

Open-only pipeline artifacts are persisted to:
- `data/raw/<project>/<signal>/<runId>.json`
- `data/processed/<project>/real_signals_<runId>.json`
- `data/provenance/<project>/sources.json`
- `data/provenance/<project>/runs/<runId>.json`
- `data/quality/<project>/quality_report.json`
- `data/quality/rankings.json`

## VM Scheduler Helpers
- `scripts/ops/refresh_data.sh` runs the full open-only refresh pipeline (`data:refresh:open`).
- `scripts/ops/refresh_media.sh` runs Replicate media generation.
- `scripts/ops/vm_crontab.example` provides sample cron entries for a single-server VM deployment.

### Generate Visual Assets (Replicate)
Set a one-time session token and run:
```bash
export REPLICATE_API_TOKEN=<your-replicate-token>
npm run media:build
```

`media:build` automatically prefers `.venv/bin/python` when present.

`npm run media:build:dry` prints the work plan without calling the API.
All generated outputs are written to `public/assets/<project>/` and consumed by project pages if present.

Data provenance notes live in `data/cards/`.

## Tests
```bash
npm run typecheck
npm run lint
npm test
PW_TEST_PORT=3501 npm run test:e2e
npm run qa:visual:10
```

Visual loop outputs are written to:
`tmp/visual-loops/<timestamp>/report.json` and `tmp/visual-loops/<timestamp>/*.png`.

## Quality Gates
Run architecture + hygiene + build/perf checks:
```bash
npm run qa
```

Run individual gate groups:
```bash
npm run contracts:check
npm run hygiene:check
npm run perf:check
npm run perf:check:strict
```

Cleanup local runtime artifacts:
```bash
npm run hygiene:clean
```
