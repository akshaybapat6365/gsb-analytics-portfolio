# Remediation Roadmap (Root-Fix Sequence)

## Objective
Convert repeated symptom churn into stable, architecture-level quality gains.

## Wave 1: Contract Stabilization (`P0` blockers)

### W1.1 Route Composition Contract
- **Action**: Standardize each project route to one canonical path.
- **Keep**: `page.tsx`, `Hero.tsx`, `*Shell.tsx`, `InteractiveSection.tsx`, `*Interactive.tsx`.
- **Decommission after migration**: legacy direct route logic if duplicated.
- **Deliverable**: `docs/contracts/route-composition.md` with required component sequence.
- **Acceptance**:
  - No orphan route architecture files.
  - `rg` checks prove one active path per project section.

### W1.2 Data Policy Contract
- **Action**: Establish environment-specific canonical mode:
  - `prod`: strict real OR fallback (explicitly choose one)
  - `demo`: fallback with watermark
  - `offline`: synthetic with watermark
- **Deliverable**: `docs/contracts/data-policy.md` + runtime mode badge in UI.
- **Acceptance**:
  - UI copy, scripts, and data cards all aligned.
  - No contradictory statements in docs/components.

### W1.3 Repository Hygiene Enforcement
- **Action**: add pre-commit/CI checks:
  - block `__pycache__` artifacts
  - block orphan/unused route files
  - ensure no secrets in tracked files
- **Acceptance**:
  - clean working tree after build/test.
  - hygiene checks fail on artifact leakage.

---

## Wave 2: Visual-System Reconstruction

### W2.1 Semantic Token Refactor
- **Action**: replace color-name enums (`cyan/amber/...`) with intent tokens (`risk`, `growth`, `ops`, `capital`).
- **Targets**: `lib/projects/catalog.ts`, `components/projects/ProjectCard.tsx`, global styles.
- **Acceptance**:
  - token names describe semantics, not arbitrary colors.
  - no cyan/purple remnants unless explicitly intended by theme contract.

### W2.2 Per-Project Module Grammar
- **Action**: split shared generic modules into route-aware renderers where needed.
- **Targets**:
  - `ProjectFrame` variants
  - bespoke chart containers per project
  - route-specific section cadence
- **Acceptance**:
  - each project has distinct hierarchy, not just palette shifts.

### W2.3 Typography Governance
- **Action**: codify approved font matrix (global + per-route).
- **Acceptance**:
  - font usage is deterministic and lintable.
  - body, display, and data roles are consistently applied.

---

## Wave 3: Analytical Depth Upgrade

### W3.1 Decision Engines Per Project
- **Action**: add `lib/decision-engines/<project>.ts` with explicit inputs/outputs.
- **Contract**:
  - inputs: payload + control state
  - outputs: KPI vector + confidence + explanation traces
- **Acceptance**:
  - viewmodels become thin adapters over decision engines.

### W3.2 Annotation and Evidence Density
- **Action**: define minimum annotation requirements per chapter.
- **Acceptance**:
  - each project chapter has annotated inflections linked to evidence refs.

### W3.3 Chart Grammar Upgrade
- **Action**: replace generic sparkline as primary chart for projects 2–6.
- **Acceptance**:
  - each project has domain-specific primary visual with readable axes/legends/callouts.

---

## Wave 4: Performance and Delivery Hardening

### W4.1 Home Route Deferral Completion
- **Action**: switch home to deferred heavy modules where needed.
- **Acceptance**:
  - route JS budget and interaction readiness targets met.

### W4.2 Asset Registry Integration
- **Action**: introduce typed asset manifest consumed by route components.
- **Acceptance**:
  - generated media has deterministic consumption path and fallbacks.

### W4.3 CI Quality Gates
- **Action**: add automated checks from `docs/audit/05-qa-gates.md`.
- **Acceptance**:
  - merge blocked on performance, visual-contract, or data-policy failures.

---

## Delivery Plan and Ownership
- **Architecture owner**: route/data contract stabilization (Wave 1)
- **Design systems owner**: token + typography + module grammar (Wave 2)
- **Analytics owner**: decision engines + evidence density (Wave 3)
- **Platform owner**: perf budgets + CI gates + asset registry (Wave 4)

## Risk Register
1. Refactor churn can increase short-term instability without branch discipline.
2. Visual overhaul may regress accessibility if contrast/typography checks are not enforced.
3. Data-policy shift can break demos unless explicit mode badging is introduced first.

## Rollout Strategy
1. Land Wave 1 contracts before any visual polish changes.
2. Land Wave 2 and Wave 3 in alternating PRs to keep review scope controlled.
3. Make Wave 4 gates mandatory only after initial pass is green for all routes.
