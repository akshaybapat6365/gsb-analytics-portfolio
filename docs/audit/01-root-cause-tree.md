# Root-Cause Tree (Architecture-Level)

## Method
Each root cause is listed with:
- observed symptom family
- evidence (file:line)
- why symptom fixes keep recurring
- architectural decision required to close it

---

## RC-01 (`P0`): Route Architecture Drift (Parallel Systems)

### Symptoms
- Repeated “we changed a lot but quality still feels same.”
- Inconsistent behavior between route sections and render timings.
- Refactors partially applied without decommissioning old paths.

### Evidence
- Parallel route implementation layers:
  - `app/projects/ord-lga-price-war/PriceWarClient.tsx:44`
  - `app/projects/ord-lga-price-war/OrdLgaShell.tsx:7`
  - `app/projects/ord-lga-price-war/OrdLgaInteractive.tsx:11`
  - `app/projects/ord-lga-price-war/InteractiveSection.tsx:11`
  - same pattern across `fraud-radar`, `target-shrink`, `starbucks-pivot`, `tesla-nacs`, `netflix-roi`
- Legacy/orphaned data-fetch path still present:
  - `lib/data/useValidatedJson.ts:14` (no active imports)
- Incomplete performance refactor artifacts present but unused:
  - `components/home/DeferredPortfolioPulse.tsx:10`
  - `components/home/DeferredSignalWall.tsx:10`
  - `app/page.tsx:6` and `app/page.tsx:7` still import non-deferred versions.

### Why fixes recur
Without a single enforced composition contract, every redesign adds another layer instead of replacing prior layers.

### Decision required
Define one route contract and enforce it:
- `Page (server)` -> `Hero (server)` -> `BLUF/Data` -> `Shell (server)` -> `InteractiveSection (client dynamic)`.
- Remove or archive old `*Client` entrypoints once wrapped behavior is migrated.

---

## RC-02 (`P0`): Visual Contract Is Not Truly Per-Project

### Symptoms
- “All pages feel similar despite color/font tweaks.”
- Visual identity perceived as template-like.

### Evidence
- Shared structural primitives dominate route rendering:
  - `components/layout/ProjectFrame.tsx:23`
  - `components/viz/ModuleSparkline.tsx:43`
  - `components/viz/AnnotatedVizFrame.tsx:20`
- Shared panel grammar globally controls all pages:
  - `app/globals.css:91` (`.panel,.glass,.neo-panel`)
  - `app/globals.css:110` (`.panel-strong,.glass-strong`)
- Shared backdrop grammar reused with tint swaps:
  - `components/projects/ProjectBackdrop.tsx:19`

### Why fixes recur
Identity is being applied via palette overlays, not via layout grammar, chart grammar, or typographic hierarchy.

### Decision required
Promote per-project “design grammar” to first-class contract:
- separate module templates per project type
- separate chart grammar classes per project
- enforce per-project typographic scale and spacing tokens, not just color vars.

---

## RC-03 (`P0`): Data Integrity Policy Is Internally Contradictory

### Symptoms
- User sees contradictory states: “strict real” vs “fallback baseline” vs “synthetic default”.
- Perception that the app is unreliable or inconsistent.

### Evidence
- Data cards declare synthetic default:
  - `data/cards/README.md:3`
- UI copy states baseline fallback keeps modules active:
  - `components/story/RealSignalsPanel.tsx:85`
  - `components/story/RealSignalsPanel.tsx:196`
- Pipeline supports strict and fallback modes in same executable path:
  - `scripts/python/build_partial_real.py:72` (stale cache path)
  - `scripts/python/build_partial_real.py:119` (baseline fallback path)
- Scripts expose both strict and fallback modes:
  - `package.json:22`, `package.json:24`

### Why fixes recur
There is no single source of truth for runtime policy. UX copy, data cards, and pipeline mode can diverge.

### Decision required
Define one explicit runtime policy matrix per environment:
- `prod`: strict real gating OR baseline fallback (pick one)
- `demo`: baseline fallback with explicit watermark
- `offline`: synthetic-only with explicit watermark

---

## RC-04 (`P0`): Analytical Depth Is Not Encapsulated in Strong Domain Layers

### Symptoms
- “Charts are there, but analytical insight feels thin.”
- Visual complexity outpaces decision rigor.

### Evidence
- Viewmodels are mostly direct aggregates, not domain inference layers:
  - `lib/viewmodels/airline.ts:4`
  - `lib/viewmodels/fraud.ts:4`
  - `lib/viewmodels/netflix.ts:4`
  - `lib/viewmodels/starbucks.ts:4`
- Generic sparkline reused as core chart in all projects:
  - `components/viz/ModuleSparkline.tsx:16`

### Why fixes recur
There is no dedicated decision engine layer with project-specific metric derivations, confidence logic, and assumptions model.

### Decision required
Introduce per-project `decision-engine` modules with explicit contracts:
- input payload + control state
- output KPI vector + confidence + explanation traces
- tested deterministic formulas.

---

## RC-05 (`P1`): Typography Governance Is Inconsistent With Requested Brand Direction

### Symptoms
- Repeated dissatisfaction with fonts and perceived style mismatch.

### Evidence
- Global body font is sans by default:
  - `app/layout.tsx:53`
  - `app/globals.css:50`
- Project layouts switch to mixed display/UI fonts with no governance:
  - `app/projects/ord-lga-price-war/layout.tsx:1` (Archivo)
  - `app/projects/fraud-radar/layout.tsx:1` (Newsreader)
  - `app/projects/netflix-roi/layout.tsx:1` (Playfair Display)
  - `app/projects/target-shrink/layout.tsx:1` (Sora)
  - `app/projects/tesla-nacs/layout.tsx:1` (Rajdhani)

### Why fixes recur
No documented/validated typography contract with ownership and acceptance checks.

### Decision required
Create a strict typography matrix:
- global body/UI/data-display roles
- per-route allowed overrides
- CI check for disallowed font families.

---

## RC-06 (`P1`): Token Semantics Drift (Naming vs Actual Color Behavior)

### Symptoms
- Confusing accent behavior and maintenance errors.

### Evidence
- Project metadata still declares `accent: "cyan"` for routes now styled amber/rust:
  - `lib/projects/catalog.ts:14`
  - `lib/projects/catalog.ts:25`
  - `lib/projects/catalog.ts:69`
- Accent mapping remaps `cyan` to amber-style classes:
  - `components/projects/ProjectCard.tsx:6`
  - `components/projects/ProjectCard.tsx:17`
  - `components/projects/ProjectCard.tsx:27`

### Why fixes recur
Semantic token names no longer represent actual visual intent.

### Decision required
Refactor to semantic intent tokens (`risk`, `profit`, `ops`, `capital`, etc.) and remove color-name enums.

---

## RC-07 (`P1`): Performance Refactor Is Partial and Not Gate-Enforced

### Symptoms
- Perceived slowness despite lazy loading modules.

### Evidence
- Lazy gate exists and works:
  - `components/perf/LazyInteractiveGate.tsx:13`
- But non-deferred heavy home modules still loaded directly:
  - `app/page.tsx:4`
  - `app/page.tsx:5`
- Deferred home wrappers exist but are unused:
  - `components/home/DeferredPortfolioPulse.tsx:10`
  - `components/home/DeferredSignalWall.tsx:10`

### Why fixes recur
No measurable route budget enforcement in CI.

### Decision required
Add route-level JS/LCP budgets and fail CI on breaches; enforce deferred entrypoints for heavy modules.

---

## RC-08 (`P1`): Asset Pipeline and Frontend Consumption Are Decoupled

### Symptoms
- Generated assets can be created but not reflected on pages.

### Evidence
- Replicate pipeline writes to `public/assets/<project>`:
  - `scripts/replicate/build_assets.py:163`
- UI no longer references generated asset files directly:
  - no `/assets/...` references in `app/` or `components/`.
- Manifest prompts still encode now-rejected visual direction (cyan/electric language):
  - `scripts/replicate/manifests/tesla-nacs.json`
  - `scripts/replicate/manifests/ord-lga-price-war.json`

### Why fixes recur
Generation and rendering are not connected by a typed asset registry contract.

### Decision required
Create `asset-manifest.ts` consumed by route components, with per-route fallback rules and constraints.

---

## RC-09 (`P2`): Test Suite Verifies Presence, Not Quality

### Symptoms
- Tests pass while UX quality remains unacceptable.

### Evidence
- E2E smoke validates route render and element presence:
  - `tests/e2e/smoke.spec.ts:23`
  - `tests/e2e/smoke.spec.ts:47`
- Unit tests focus on schema parsing and simple math:
  - `tests/payloads.test.ts:17`
  - `tests/metrics.test.ts:4`

### Why fixes recur
No tests for narrative density, annotation quality, visual differentiation, or performance budgets.

### Decision required
Add contract tests for:
- per-project unique style tokens/layout markers
- minimum annotation density
- KPI consistency under control changes
- route budget thresholds.

---

## RC-10 (`P2`): Repository Hygiene Drift During Iteration

### Symptoms
- High churn and reproducibility issues.

### Evidence
- Runtime artifacts present in working tree under python package paths:
  - `scripts/python/**/__pycache__/*.pyc`
- active working tree contains large partial refactor footprint (modified + untracked source files).

### Why fixes recur
No enforced pre-commit hygiene and no clean-room branch integration discipline.

### Decision required
Add hygiene checks in CI/pre-commit:
- block pycache artifacts
- block orphaned duplicate route files
- require clean route-contract manifest before merge.
