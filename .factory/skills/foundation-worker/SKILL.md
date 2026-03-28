---
name: foundation-worker
description: Repair baseline reproducibility and strengthen shared trust, data, and route architecture foundations.
---

# Foundation Worker

NOTE: Startup and cleanup are handled by `worker-base`. This skill defines the WORK PROCEDURE.

## When to Use This Skill

Use this skill for features that change shared infrastructure or cross-cutting architecture, including:
- install/build/test reproducibility fixes
- route-composition consistency fixes
- shared trust/provenance surfaces
- portfolio-wide evidence taxonomy and metadata consistency
- open-data pipeline / payload publication / provenance-quality plumbing
- build blockers that prevent validation from running

## Required Skills

- `agent-browser` — use when the feature changes a user-facing route or shared UI/trust surface and manual browser verification is possible.
- `review` — use before finishing if the feature changes multiple shared architectural surfaces and a targeted review would materially reduce risk.

## Work Procedure

1. Read `mission.md`, `AGENTS.md`, `.factory/services.yaml`, `.factory/library/architecture.md`, `.factory/library/environment.md`, and `.factory/library/user-testing.md` before touching code.
2. Restate the feature's fulfilled validation assertions to yourself and treat them as the acceptance target.
3. Establish the baseline first:
   - run the exact install/env/build/test commands relevant to the feature from `.factory/services.yaml`
   - confirm the current failure mode before implementing anything
4. Follow TDD when adding or changing test-covered behavior:
   - add or update failing tests first
   - run the narrowest relevant test command and confirm failure
   - implement the fix
   - rerun the narrow test, then broader gates
5. For architecture or shared-contract fixes, inspect all affected surfaces before editing. Do not patch one route or one metadata source if the contract requires portfolio consistency.
6. If the feature touches trust/provenance semantics, verify both:
   - route-level trust surfaces
   - portfolio-level card/metadata surfaces
7. If the feature touches browser-facing behavior, use `agent-browser` for at least one end-to-end route check unless blocked by infrastructure.
8. Before handoff, run the highest relevant verification stack you can support from the manifest. At minimum include the narrow test(s) plus typecheck/lint for changed code; include build when the feature affects runtime/build reproducibility.
9. Record exact commands, observations, browser interactions, and any unresolved blockers in the handoff. Do not claim success without naming what changed and what passed.

## Example Handoff

```json
{
  "salientSummary": "Fixed the missing build dependency and standardized Node-20 install behavior so build and browser validation can run again. Also aligned shared trust metadata so home/index cards no longer drift from route-level evidence framing.",
  "whatWasImplemented": "Added the missing runtime dependency required by the production build, updated install/bootstrap flow to use the mission-standard Node 20 path, and normalized shared trust metadata between the project catalog and route BLUF surfaces. The foundation now supports build + route smoke validation without the prior reproducibility blocker.",
  "whatWasLeftUndone": "Playwright coverage still needs broader route assertions beyond the repaired smoke path; that belongs to later milestone work.",
  "verification": {
    "commandsRun": [
      {
        "command": "source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && npm install --legacy-peer-deps",
        "exitCode": 0,
        "observation": "Dependencies installed successfully under Node 20 with no missing-package error."
      },
      {
        "command": "source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && npm run build",
        "exitCode": 0,
        "observation": "Production build completed successfully; prior missing dependency error is gone."
      },
      {
        "command": "source /home/mostltyharmless/.nvm/nvm.sh && nvm use 20.20.0 >/dev/null && npm run typecheck && npm run lint",
        "exitCode": 0,
        "observation": "Typecheck and lint both passed after shared metadata updates."
      }
    ],
    "interactiveChecks": [
      {
        "action": "Opened /, /projects, and /projects/fraud-radar in agent-browser and compared evidence level/source/as-of framing",
        "observed": "Home card, index card, and Fraud BLUF all showed consistent evidence semantics after the shared metadata fix."
      }
    ]
  },
  "tests": {
    "added": [
      {
        "file": "tests/payloads.test.ts",
        "cases": [
          {
            "name": "catalog evidence metadata stays aligned with route payload framing",
            "verifies": "Shared trust metadata cannot drift across portfolio surfaces without failing the test."
          }
        ]
      }
    ]
  },
  "discoveredIssues": [
    {
      "severity": "medium",
      "description": "ORD-LGA still uses a route-specific trust presentation instead of the shared trust drawer pattern used by the other five routes.",
      "suggestedFix": "Track a follow-up feature to either standardize ORD-LGA onto the shared trust stack or intentionally formalize the variance."
    }
  ]
}
```

## When to Return to Orchestrator

- A required cross-cutting change affects more routes or metadata sources than the feature description covers and needs decomposition.
- Build/test/browser validation is blocked by infrastructure or dependency failures outside the feature's reasonable scope.
- Shared trust semantics conflict with the mission contract or require a product-level decision.
- The route-composition contract cannot be satisfied without reordering milestones or introducing a new foundation feature.
