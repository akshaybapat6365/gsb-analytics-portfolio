# User Testing

Testing surface findings, required testing tools, and validation concurrency guidance.

**What belongs here:** browser validation surfaces, setup requirements, route inventory, trust-surface expectations, and resource-cost classification.
**What does NOT belong here:** implementation tasks or mission planning prose.

---

## Validation Surface

Primary surface: web UI.

Published case-study routes for this mission:
- `/projects/ord-lga-price-war`
- `/projects/fraud-radar`
- `/projects/target-shrink`
- `/projects/starbucks-pivot`
- `/projects/tesla-nacs`
- `/projects/netflix-roi`

Additional routes in scope:
- `/`
- `/projects`
- `/resume`

### Required validation tools
- `agent-browser` for user-facing route validation and cross-route navigation checks.
- Playwright for route-level smoke/e2e coverage now that the build baseline is repaired.
- `curl` for simple reachability and metadata checks where appropriate.

### Validation expectations
- Validate trust surfaces directly in the browser; do not rely on README-only explanations.
- For every changed route, inspect BLUF/top summary, trust/provenance state, and assumptions/limitations where present.
- Route loading/error assertions may require fault-injection or controlled validation setup; otherwise treat them as conditional and validate only when reproducibly triggerable.
- ORD–LGA is a structural outlier relative to the shared trust-surface pattern used by the other five project routes; validators should still require top-level trust/evidence framing parity.

## Validation Concurrency

Machine profile observed during planning dry run:
- 8 CPU cores
- ~16 GB RAM total
- ~11.1 GB available at baseline during planning
- Light dev/test dry run reduced available memory by about 0.8 GB

### Browser concurrency classification
- Surface: `agent-browser` on local web app
- Initial max concurrent validators: **2**
- Rationale: use a conservative 70% headroom posture on a shared workstation. Build/e2e startup is repaired, but browser concurrency should stay conservative until broader route validation is profiled.

### Playwright concurrency classification
- Initial worker count for validation: **2**
- Rationale: aligns with the same conservative browser budget on this machine.

## Validation Readiness Notes

Latest foundation findings:
- `npm run env:check`: passed
- `npm run dev:doctor`: passed
- local dev route reachability on port 3401: passed
- representative Vitest path: passed
- `npm run build`: passes after adding `@deck.gl/widgets`
- Playwright validation now launches against the built app on port 3501; current failures are narrowed to smoke assertions for the home title and ORD-LGA trust-surface parity

Validators should treat build/e2e readiness as restored. Any remaining Playwright failures should be evaluated as route-level contract issues rather than baseline infrastructure breakage.
