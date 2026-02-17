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

Primary typography: **Instrument Serif** (paired with **Instrument Sans** for UI).

## Prereqs
- Node: `20.x` (recommended). Repo includes `.nvmrc` and `package.json#engines`.

Quick check:
```bash
npm run env:check
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

## Generate Data (Synthetic)
The site ships with synthetic payloads already committed under `public/data/**`.

To regenerate:
```bash
npm run data:build
```

To enrich all projects with strict real-only partial coverage metadata/signals:
```bash
npm run data:build:real
```

`data:build:real` will never synthesize missing real feed values. Missing sources are marked `unavailable`
in `payload.meta.modules` and `payload.realSignals`.
It also writes run health files to:
- `public/data/_health.json`
- `public/data/_runs/<runId>.json`

## VM Scheduler Helpers
- `scripts/ops/refresh_data.sh` runs synthetic build + strict real enrichment.
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
```
