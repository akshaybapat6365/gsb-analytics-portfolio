# QA Gates (Non-Negotiable)

## Gate Groups
- G1 Architecture
- G2 Data Integrity
- G3 Visual Differentiation
- G4 Analytical Depth
- G5 Performance
- G6 Reliability

---

## G1 Architecture Gates

### G1.1 Canonical Route Contract
- Each project route must follow the agreed sequence:
  - `Hero` -> `BLUF` -> `Data Integrity` -> `Interactive A` -> `Interactive B` -> `Decision Console` -> `Assumptions`.
- Verification:
  - static route checks in e2e and route snapshots.

### G1.2 No Orphaned Pathways
- No unused route architecture files.
- Verification command:
```bash
rg -n "useValidatedJson|DeferredPortfolioPulse|DeferredSignalWall" app components lib
```
Expected: no orphaned architecture utilities unless intentionally referenced.

---

## G2 Data Integrity Gates

### G2.1 Single Runtime Data Policy
- UI and docs must agree on runtime mode (`strict`, `fallback`, or `synthetic`).
- Verification:
  - grep docs/components for contradictory policy strings.

### G2.2 Decision Modules Must Not Hard-Fail On Partial Feeds
- Required modules show `blocked/partial/ready` with explicit rationale.
- Verification:
  - route renders with simulated unavailable signals without blanking core sections.

### G2.3 Provenance Presence
- Every displayed real signal includes provenance source and as-of when available.
- Verification:
  - `ProvenanceTooltip` rendered for all signals.

---

## G3 Visual Differentiation Gates

### G3.1 Per-Project Distinctness
- Each project must have distinct:
  - typography pairing
  - section rhythm
  - chart style
  - motion profile
- Verification:
  - screenshot review and route metadata markers.

### G3.2 No Token-Semantic Drift
- Token names must represent semantic role, not stale color names.
- Verification:
  - no `accent: "cyan"` style naming if not genuinely cyan strategy.

---

## G4 Analytical Depth Gates

### G4.1 Decision Engine Presence
- Each project has deterministic decision-engine logic separated from presentation.
- Verification:
  - unit tests for formula outputs and edge conditions.

### G4.2 Minimum Narrative Density
- Per project:
  - 2+ interactive analytical charts
  - 1+ annotated timeline/callout rail
  - 1+ decision evidence panel with drivers and confidence band
- Verification:
  - e2e assertions for chart and annotation test IDs.

---

## G5 Performance Gates

### G5.1 Budget Targets
- Home route:
  - LCP < 1.8s desktop target
  - initial JS < 180KB gz target
- Project routes:
  - no heavy interactive mount before viewport gate
- Verification:
  - CI perf script + lighthouse profile + runtime perf logs.

### G5.2 Deferred Heavy Modules
- Home and project heavy modules must be deferred where required.
- Verification:
  - dynamic import checks and smoke assertions.

---

## G6 Reliability Gates

### G6.1 Hydration Safety
- No hydration mismatch warnings.
- Verification:
  - console assertions already in e2e (`tests/e2e/smoke.spec.ts`).

### G6.2 Runtime Start Reliability
- `npm run dev` must always produce deterministic URL and healthcheck success.
- Verification:
  - dev scripts under `scripts/dev/`.

### G6.3 Hygiene
- No runtime artifacts committed.
- Verification:
```bash
git status --short
```
should not show generated caches/artifacts after standard workflows.

---

## Minimum Release Criteria
Release is blocked unless all are true:
1. G1, G2, G6 pass completely.
2. G3 and G4 pass for all six projects.
3. G5 pass for home + all project routes in production profile.
