# Symptom vs Root Matrix

## Purpose
Map repeated user-visible complaints to underlying architecture causes, with proof and corrective direction.

| Symptom (Observed) | Root Cause IDs | Evidence | Why symptom fixes failed | Corrective Direction |
|---|---|---|---|---|
| “Projects changed but still look same / ugly.” | `RC-02`, `RC-06` | `components/layout/ProjectFrame.tsx:23`, `components/viz/ModuleSparkline.tsx:43`, `components/projects/ProjectCard.tsx:6` | Mostly color/tint updates on shared module skeletons; semantics and composition unchanged. | Create per-project module grammar and semantic token system; remove color-name token leakage. |
| “Fonts still not right.” | `RC-05` | `app/layout.tsx:53`, `app/globals.css:50`, project `layout.tsx` files | No locked typography policy, only ad hoc route overrides. | Introduce typography governance matrix + static checks. |
| “Data unavailable appears randomly / messaging conflicts.” | `RC-03` | `data/cards/README.md:3`, `components/story/RealSignalsPanel.tsx:85`, `scripts/python/build_partial_real.py:119` | Strict/fallback/synthetic mode is not unified at runtime policy level. | Define one canonical environment policy and render explicit mode badges. |
| “We keep fixing and regressing.” | `RC-01`, `RC-10` | parallel route files under `app/projects/*`, orphan modules (`lib/data/useValidatedJson.ts:14`) | Partial migrations leave old and new layers in parallel; hygiene drift increases merge noise. | Enforce route composition contract and remove orphaned paths as part of migration checklist. |
| “Text-heavy, not analytics-heavy.” | `RC-04`, `RC-09` | `lib/viewmodels/*.ts`, smoke-only checks in `tests/e2e/smoke.spec.ts` | Visual wrappers grew faster than decision-engine depth; tests do not fail for shallow analytics. | Add project decision-engine modules + density/quality test gates. |
| “Performance still poor.” | `RC-07`, `RC-09` | `app/page.tsx:4`, `components/home/DeferredPortfolioPulse.tsx:10` | Lazy strategy exists but is not consistently applied nor budget-enforced. | Enforce deferred heavy modules and route budget checks in CI. |
| “Asset generation does not improve rendered quality.” | `RC-08` | `scripts/replicate/build_assets.py:163`, no `/assets/` consumers in app/components | Generation pipeline and render pipeline are disconnected. | Create typed asset registry consumed by route heroes/modules. |

## Priority Cluster
1. **Stop regression loop**: `RC-01`, `RC-03`, `RC-10`
2. **Establish visual identity correctness**: `RC-02`, `RC-05`, `RC-06`
3. **Raise analytical credibility**: `RC-04`, `RC-09`
4. **Finish performance and media architecture**: `RC-07`, `RC-08`

## Closure Definition
A symptom is considered closed only when:
1. its mapped root cause is remediated,
2. a test/gate exists to prevent recurrence,
3. and route-level acceptance criteria pass in `docs/audit/05-qa-gates.md`.
