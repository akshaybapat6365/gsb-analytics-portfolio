# Multi-Agent Orchestration Contract

## Objective
Run full-site redesign and QA as a deterministic hierarchy:
- 1 global orchestrator
- 6 project meta-agents (`P1` through `P6`)
- 12 sub-agents per meta-agent
- 4 mini-agents per sub-agent (`design`, `data`, `implementation`, `validation`)

## Execution Topology
- `P0` orchestrator handles shared UI system, route shell consistency, and release gates.
- `P1` to `P6` each own one project route.
- Every project route runs the same 12 lanes:
  1. Narrative thesis
  2. Data readiness + provenance
  3. Typography/palette tokenization
  4. Hero art direction
  5. Primary chart module
  6. Secondary chart module
  7. Control surface + decision console
  8. Accessibility and responsive polish
  9. SSR/hydration reliability
  10. Performance budgets
  11. Loading/error fallbacks
  12. QA evidence + signoff

## Hard Stop Gates
Work is complete only when:
1. `npm run lint` passes
2. `npm run typecheck` passes
3. `npm run build` passes
4. `npm run perf:check` passes
5. `npm run test:e2e` passes
6. `npm run qa:visual:10` returns zero failed rounds

## Visual Loop Gate
- Runner: `scripts/perf/visual_loop_rounds.mjs`
- Script command: `npm run qa:visual:10`
- Routes covered:
  - `/`
  - `/projects`
  - `/projects/ord-lga-price-war`
  - `/projects/fraud-radar`
  - `/projects/target-shrink`
  - `/projects/starbucks-pivot`
  - `/projects/tesla-nacs`
  - `/projects/netflix-roi`

## Required Evidence Artifacts
- `tmp/visual-loops/<timestamp>/report.json`
- `tmp/visual-loops/<timestamp>/**/*.png`
- Test/build logs captured from CLI

## Skill Runtime Mapping
- `frontend-design-official`: visual direction and composition quality
- `claude-d3js-skill`: annotation-heavy custom charts
- `webgpu-threejs-tsl`: selective high-value GPU visuals
- `wiggle-claude-skill`: motion accents only where narrative value exists
- `bencium-*`: consistency and layout rigor
- `storytelling-web`: chapter sequencing and narrative pacing
- `ui-ux-pro-max`: token + palette + contrast quality checks
- `frontend-dev-visual-loop`: closed-loop screenshot QA adapter
