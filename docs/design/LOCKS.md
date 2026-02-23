# Do Not Debate Locks (Current Build Phase)

These constraints are frozen for this phase. Changes that violate any lock do not ship.

## Product locks

1. Proof-first UX
   - Above fold must answer who this is for, what decision it supports, and the output value.
   - Aesthetic-only modules are not allowed above fold.
2. Evidence survives screenshots
   - Any numeric claim must render adjacent to evidence framing.
   - Minimum framing: evidence level + source + as-of date.
3. Story spine is fixed
   - Every project page keeps the same section order:
     - Hero decision context
     - BLUF with key output
     - Simulator shell
     - Interactive section
     - Data integrity + provenance
     - Assumptions + limitations
4. Per-project theme packs are mandatory
   - Visual language can vary by route.
   - Information architecture and evidence semantics cannot vary.

## Accessibility and quality locks

1. WCAG AA minimum contrast for body text and interactive controls.
2. Metadata and functional UI text must stay readable at normal zoom.
3. Keyboard focus states must remain visible on all clickable controls.
4. Dev overlays and debug badges are never visible in production.

## Performance locks

1. Heavy interactive modules remain deferred below fold where possible.
2. No autoplay hero media that blocks initial render.
3. Route budgets are enforced by `scripts/perf/check_route_budgets.mjs`.
4. Motion budget:
   - No perpetual decorative loops.
   - Motion is for state transitions, guided attention, or one-time section reveal.
   - Respect `prefers-reduced-motion`.

## Release gates

The pipeline must pass before merge:

1. Contract checks:
   - `npm run contracts:check:strict`
2. Hygiene checks:
   - `npm run hygiene:check`
3. Type + lint + tests:
   - `npm run lint`
   - `npm run typecheck`
   - `npm test`
4. Build + performance:
   - `npm run build`
   - `npm run perf:check:strict`
5. Visual verification:
   - `npm run qa:visual:10:strict`
