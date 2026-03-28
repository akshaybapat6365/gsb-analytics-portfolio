---
name: portfolio-polish-worker
description: Refine portfolio-wide information architecture, premium UI/UX consistency, and cross-project comparison surfaces.
---

# Portfolio Polish Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use this skill for cross-project presentation and portfolio-level user experience work, including:
- home page or projects-index redesign
- cross-project comparison or taxonomy surfaces
- navigation, metadata, resume, and shell-level UX improvements
- accessibility, consistency, and premium editorial polish spanning multiple routes

## Required Skills

- `agent-browser` — mandatory for any shell, navigation, comparison, or portfolio-surface change.
- `frontend-design` — mandatory when redesigning portfolio-level UI/UX or editorial presentation.
- `web-design-guidelines` — use to review accessibility and design quality when modifying shared portfolio surfaces.

## Work Procedure

1. Read `mission.md`, `AGENTS.md`, `.factory/services.yaml`, `.factory/library/architecture.md`, and `.factory/library/user-testing.md` first.
2. Read the feature's fulfilled validation assertions and identify all affected surfaces (home, projects index, resume, shared shell, metadata, comparison views).
3. Audit the portfolio experience holistically before editing:
   - how users enter
   - how they discover and compare projects
   - how trust framing appears before drill-down
   - how they recover and continue browsing
4. Follow TDD when changing metadata logic, catalog logic, or shared state transformations.
5. When making design changes, preserve or improve accessibility:
   - keyboard focus
   - visible navigation state
   - readable trust framing
   - non-destructive motion
6. Use `agent-browser` for an end-to-end portfolio browsing walkthrough that covers home -> projects -> detail -> back navigation and resume access.
7. Run the relevant validation stack before handoff:
   - narrow tests for catalog/viewmodel/metadata changes
   - typecheck/lint
   - broader build if shared shell or route metadata changed
8. Record concrete before/after browsing outcomes, not aesthetic conclusions only.

## Example Handoff

```json
{
  "salientSummary": "Redesigned the home and projects-index surfaces around cross-project comparison and trust-first discovery. Users can now compare evidence level, source, and result framing without drilling into each route, and navigation back from resume/detail pages remains consistent.",
  "whatWasImplemented": "Updated the global portfolio shell, home project grid, and projects-index filtering/presentation to emphasize cross-project comparison for data-science peers. Added clearer evidence/freshness framing, improved empty-state handling, and tightened keyboard-visible focus behavior across nav, filters, and project links.",
  "whatWasLeftUndone": "Project-level route upgrades still determine the richness of each individual decision packet; this feature only improved portfolio-level discovery and comparison surfaces.",
  "verification": {
    "commandsRun": [
      {
        "command": "source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && ./node_modules/.bin/vitest run tests/payloads.test.ts",
        "exitCode": 0,
        "observation": "Catalog/viewmodel trust metadata tests passed after portfolio-level card updates."
      },
      {
        "command": "source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && npm run typecheck && npm run lint",
        "exitCode": 0,
        "observation": "Typecheck and lint passed for shared shell and card surfaces."
      }
    ],
    "interactiveChecks": [
      {
        "action": "Browsed / -> /projects -> filtered to one evidence level -> opened a project -> returned to /projects -> opened /resume -> returned home",
        "observed": "Navigation remained intact, filters were usable, and trust metadata stayed visible and consistent across the journey."
      },
      {
        "action": "Tabbed through nav, filter pills, and project cards",
        "observed": "Visible focus states were present and keyboard activation worked across major portfolio surfaces."
      }
    ]
  },
  "tests": {
    "added": [
      {
        "file": "tests/payloads.test.ts",
        "cases": [
          {
            "name": "portfolio cards preserve evidence/source/as-of consistency across home and projects views",
            "verifies": "Catalog metadata cannot drift between major portfolio browsing surfaces."
          }
        ]
      }
    ]
  },
  "discoveredIssues": [
    {
      "severity": "medium",
      "description": "Some project routes still surface richer trust details only after drill-down, limiting how much credibility can be conveyed at the portfolio surface alone.",
      "suggestedFix": "Address through later case-study or synthesis features if validators find portfolio-level trust still too shallow."
    }
  ]
}
```

## When to Return to Orchestrator

- The requested polish depends on unresolved route-level or foundation-level trust inconsistencies.
- Shared UX changes would invalidate earlier milestone assumptions and require mission-wide contract updates.
- Build/runtime issues prevent reliable browser verification of portfolio surfaces.
- The feature expands from presentation polish into new analytics/data-ingestion work that should be split into separate features.
