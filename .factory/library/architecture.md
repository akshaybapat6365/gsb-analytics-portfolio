# Architecture

How the system works: components, relationships, data flows, and invariants.

**What belongs here:** high-level architecture, boundaries between route shell, payload loading, decision engines, trust surfaces, and mission-relevant weak points.
**What does NOT belong here:** low-level implementation diffs or ephemeral debugging notes.

---

## Overview

This repository is a Next.js App Router analytics portfolio presenting six domain-specific decision simulators as a single decision-intelligence product. The app already behaves like a lightweight analytics platform: server routes load typed static payloads, route shells render editorial and trust framing, and client-side interactive modules expose scenario controls and recommendation surfaces.

The mission's architectural focus is the seam between open-data ingestion, provenance/readiness reporting, route-level decision outputs, and premium user-facing analytical storytelling.

## Major Components

### App shell
- `app/**` contains the home page, projects index, resume page, and six project routes.
- Shared shell behavior lives in `app/layout.tsx` and common UI such as navigation, footer, and route loading/error surfaces.

### Portfolio metadata and taxonomy
- `lib/projects/catalog.ts` is the central source of truth for project-level metadata: slug, domain, BLUF, evidence level, result summary, source, and as-of framing.
- Home and projects-index surfaces derive trust-facing card metadata from this catalog.

### Payload loading and validation
- `lib/server/payloads.ts` loads each route's primary payload from `public/data/**`.
- `lib/server/loadPublicJson.ts` provides cached JSON loading with path safety.
- `lib/schemas/*.ts` and `lib/schemas/common.ts` validate payload shape with Zod.

### Decision and viewmodel layer
- `lib/decision-engines/**` computes normalized recommendation outputs per domain.
- `lib/viewmodels/**` adapts payload and decision outputs for route-specific and portfolio-level UI.
- This layer is the core decision-intelligence seam and will absorb much of the analytical-rigor upgrade work.

### Shared story and trust UI
- `components/story/**` provides reusable decision-product primitives such as `BlufPanel`, `DecisionConsole`, `DecisionEvidencePanel`, `RealSignalsPanel`, `DataIntegrityDrawer`, and `AssumptionsDrawer`.
- These components standardize how recommendations, provenance, readiness, fallback state, and limitations are communicated.

### Visualization layer
- `components/viz/**` contains chart, map, and other visual modules.
- Heavy interactive surfaces are intended to load through lazy interactive gates for performance and hydration safety.

### Data pipeline and provenance
- Open/public-data discovery and enrichment run through `scripts/python/**`.
- Artifacts span `data/raw/**`, `data/processed/**`, `data/provenance/**`, `data/quality/**`, and final runtime payloads in `public/data/**`.
- The product already supports explicit runtime policy modes: `strict-real`, `baseline-fallback`, and `synthetic-demo`.

## Data Flow

1. Public/open sources are discovered and enriched through Python pipeline scripts.
2. Provenance, run metadata, and quality reports are stored under `data/**`.
3. Exported runtime payloads are written into `public/data/**`.
4. Route `page.tsx` files load payloads server-side through `lib/server/payloads.ts`.
5. Route shell content renders BLUF and trust framing before deeper interaction.
6. Interactive client modules expose scenario controls and recommendation outputs.
7. Shared trust UI renders policy mode, readiness, provenance, and fallback status.

## Current Invariants

- Primary route payloads are server-loaded, not client-fetched.
- Runtime payloads must validate against Zod schemas.
- Policy modes are explicit and bounded to `strict-real`, `baseline-fallback`, and `synthetic-demo`.
- Build/test/perf/contracts are intended release gates, not optional hygiene.
- Heavy interactive route surfaces should be lazy-gated.
- The canonical route composition contract is documented in `docs/contracts/route-composition.md`, though route drift already exists and must be managed during the mission.

## Known Weak Points Relevant to the Mission

- The app is still primarily static-payload driven even though the trust/provenance language is more operationally mature.
- Real-data semantics are stronger than current real-data execution depth.
- The route-composition contract is not uniformly enforced across all six project routes.
- Recommendation engines are still relatively thin over existing payloads and need stronger traceability, uncertainty framing, and evidence linkage.
- Provenance and quality artifacts exist, but they are not yet a full operational control plane for freshness/readiness.
- Foundation milestone work must first repair build reproducibility and browser-validation readiness before deeper UX/data upgrades can be validated credibly.
