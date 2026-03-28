---
name: case-study-worker
description: Upgrade an individual analytics case-study route with deeper real-data rigor, clearer decisions, and premium interactive UX.
---

# Case Study Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use this skill for a single case-study milestone or route-focused feature, including:
- upgrading one case study's data grounding, recommendation logic, and trust framing
- refining a route's charts, maps, controls, and decision packet
- strengthening one domain's provenance/readiness surfaces
- fixing route-specific loading/error, interaction, or narrative issues

## Required Skills

- `agent-browser` — mandatory when the feature changes route-level UI, controls, decision surfaces, trust surfaces, or navigation.
- `vercel-react-best-practices` — use when changing React/Next route structure, interactive state flow, or performance-sensitive UI.
- `frontend-design` — use when changing premium visual presentation, storytelling layout, or bespoke UI polish.

## Work Procedure

1. Read `mission.md`, `AGENTS.md`, `.factory/services.yaml`, `.factory/library/architecture.md`, and `.factory/library/user-testing.md` first.
2. Read the feature's fulfilled validation assertions and map them to concrete route sections before editing.
3. Inspect the full route surface, not just one component:
   - `page.tsx`
   - `Hero.tsx`
   - shell
   - interactive section/client
   - loading/error files
   - trust/evidence/assumptions surfaces
4. Follow TDD where practical:
   - add or update narrow tests for changed calculations, payload parsing, or metadata semantics first
   - confirm the test fails
   - implement the change
5. Preserve trust clarity while upgrading polish:
   - do not make the route look more certain than its evidence level supports
   - keep modeled/mixed/fallback caveats close to the final action outputs
6. If the route uses shared trust components, verify their behavior after your changes. If the route is a structural outlier, preserve or improve equivalent trust parity.
7. Use `agent-browser` to manually verify the full user flow for the route:
   - route entry
   - control interaction
   - key chart/panel updates
   - decision output
   - trust/provenance/assumptions access
8. Run relevant automated checks before finishing:
   - narrow test(s)
   - typecheck/lint for changed files
   - broader build/test commands if route architecture or shared runtime behavior changed
9. Record exact changed interactions and observed outputs in the handoff. Avoid vague phrases like “works as expected.”

## Example Handoff

```json
{
  "salientSummary": "Upgraded the Starbucks Pivot route so WFH and office-shock interactions now update the selected-store panel, queue ranking, and causal board consistently, and moved causal uncertainty closer to the final recommendation surface. Verified the route end to end in the browser.",
  "whatWasImplemented": "Refactored the Starbucks interactive state flow so selected store, queue ordering, and causal comparison outputs derive from one scenario state instead of drifting independently. Added a route-level trust panel near the decision console that keeps DiD interpretation and recommendation confidence visible while preserving the existing BLUF and provenance surfaces.",
  "whatWasLeftUndone": "The global projects index still does not surface the new route-level queue richness; that is portfolio-level polish work and outside this feature.",
  "verification": {
    "commandsRun": [
      {
        "command": "source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && ./node_modules/.bin/vitest run tests/decision-engines.test.ts",
        "exitCode": 0,
        "observation": "Scenario logic tests passed after refactoring store recommendation calculations."
      },
      {
        "command": "source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && npm run typecheck && npm run lint",
        "exitCode": 0,
        "observation": "Typecheck and lint passed for the route and shared story components."
      }
    ],
    "interactiveChecks": [
      {
        "action": "Opened /projects/starbucks-pivot, changed WFH index and office shock, then clicked two different stores on the map",
        "observed": "Selected-store panel, queue ranking, portfolio delta, and causal chart all changed together with no stale values or console errors."
      },
      {
        "action": "Opened trust/provenance and assumptions surfaces after changing scenarios",
        "observed": "Causal limitations and recommendation-confidence framing remained visible next to action outputs."
      }
    ]
  },
  "tests": {
    "added": [
      {
        "file": "tests/decision-engines.test.ts",
        "cases": [
          {
            "name": "starbucks scenario updates keep selected store and queue in sync",
            "verifies": "Scenario controls cannot change queue outputs without updating the selected-store state and recommendation packet."
          }
        ]
      }
    ]
  },
  "discoveredIssues": [
    {
      "severity": "low",
      "description": "The map-heavy route still depends on expensive client-side rendering that may need later performance tuning under broader validation.",
      "suggestedFix": "Track in a later polish/performance feature if milestone validation shows frame drops or timeouts."
    }
  ]
}
```

## When to Return to Orchestrator

- The route needs shared architectural or data-pipeline changes that exceed a single case-study feature.
- The route's trust framing cannot be made honest without changing portfolio-wide evidence taxonomy or metadata.
- Browser validation is blocked by foundation-level build/runtime issues.
- The route requires new public-data ingestion work that should be decomposed separately from UI/interaction upgrades.
