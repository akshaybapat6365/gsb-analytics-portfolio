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
- ORD-LGA recoverability validation path: on a healthy production-like runtime, validators may use `/projects/ord-lga-price-war?routeProbe=loading` and `/projects/ord-lga-price-war?routeProbe=error` as the supported, non-destructive browser-visible route-level recoverability probes for VAL-ORDLGA-006.
- Fraud Radar recoverability validation path: on a healthy production-like runtime, validators may use `/projects/fraud-radar?routeProbe=loading` and `/projects/fraud-radar?routeProbe=error` as the supported, non-destructive browser-visible route-level recoverability probes for VAL-FRAUD-005.

## URLs and Setup
- Production-like validation surface: `http://localhost:3501`
- Start command: `source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && PW_TEST_PORT=3501 npm run build && PORT=3501 ./node_modules/.bin/next start --port 3501`
- Healthcheck: `curl -sf http://localhost:3501`
- Stop command: `lsof -ti :3501 | xargs -r kill`
- Foundation user testing should use the production-like server on port 3501 so dev-only overlays do not affect assertions.

## Validation Concurrency

Machine profile observed during planning dry run:
- 8 CPU cores
- ~16 GB RAM total
- ~11.1 GB available at baseline during planning
- Light dev/test dry run reduced available memory by about 0.8 GB

### Browser concurrency classification
- Surface: `agent-browser` on local web app
- Initial max concurrent validators: **2**
- Rationale: use a conservative 70% headroom posture on a shared workstation. Build/e2e startup is repaired, browser validators share one Next.js server plus browser processes, and current machine state during foundation validation showed ~7 GiB available memory.

### Playwright concurrency classification
- Initial worker count for validation: **2**
- Rationale: aligns with the same conservative browser budget on this machine.

### curl concurrency classification
- Initial worker count for validation: **4**
- Rationale: metadata/reachability checks are lightweight GET-only operations with low memory overhead.

## Validation Readiness Notes

Latest foundation findings:
- `npm run env:check`: passed
- `npm run dev:doctor`: passed
- local dev route reachability on port 3401: passed
- representative Vitest path: passed
- `npm run build`: passes after adding `@deck.gl/widgets`
- Playwright validation now launches against the built app on port 3501; current failures are narrowed to smoke assertions for the home title and ORD-LGA trust-surface parity
- Foundation user-testing round 1 validated all 15 foundation assertions on the production-like server at `http://localhost:3501`

Validators should treat build/e2e readiness as restored. Any remaining Playwright failures should be evaluated as route-level contract issues rather than baseline infrastructure breakage.

## Flow Validator Guidance: agent-browser
- Use the shared production-like app at `http://localhost:3501`.
- Stay within assigned assertions and routes.
- Do not mutate repository files outside the assigned flow report path.
- Avoid destructive actions; interact only through normal browsing, filtering, keyboard navigation, and trust-drawer inspection.
- Save screenshots and any browser evidence under the assigned evidence directory.
- If a route-level loading or failure state cannot be triggered reproducibly, mark that assertion blocked rather than inventing evidence.
- On Next.js App Router pages, raw text capture may include streamed payload/script text; prefer screenshot evidence plus targeted checks for exact visible copy.

## Flow Validator Guidance: curl
- Use `http://localhost:3501` and only GET requests.
- Capture route-specific title/metadata evidence from returned HTML.
- Do not test localhost ports outside mission-approved boundaries.
