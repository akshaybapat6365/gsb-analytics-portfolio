import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CaseStudyTrustStack } from "@/components/story/CaseStudyTrustStack";

describe("CaseStudyTrustStack trust entrypoints", () => {
  it("renders visible keyboard-addressable controls for trust and assumptions drawers", () => {
    const markup = renderToStaticMarkup(
      createElement(CaseStudyTrustStack, {
        eyebrow: "War-Game BLUF",
        question: "Which corridor nodes should move first?",
        bluf: "Prioritize the highest readiness nodes before expanding the corridor.",
        summary: {
          homepageTitle: "Tesla NACS",
          homepageSubtitle: "Corridor build-order war game",
          problem: "Sequence corridor investments under uncertainty.",
          methodPlain: "Scenario ranking",
          resultLabel: "Recommended build count",
          resultValue: "14 nodes",
          claim: "Build where readiness and demand align.",
          claimFraming: "Modeled recommendation",
          claimType: "mixed-counterfactual",
          limitation: "Readiness inputs still mix real and modeled signals.",
          evidenceLevel: "mixed",
          source: "DOE + corridor readiness stack",
          asOf: "2026-03-01",
          provenanceLong: "Public station inventory blended with modeled readiness multipliers.",
          vizType: "nodes",
          spark: [1, 3, 2, 5],
          markerLabel: "Node priority",
          annotation: "Top nodes remain corridor-ready under the current stress case.",
        },
        assumptions: [
          "Demand and readiness multipliers remain scenario specific.",
          "Swap in live utilization before production deployment.",
        ],
        meta: {
          runId: "tesla-run-1",
          generatedAt: "2026-03-01T00:00:00.000Z",
          policyMode: "baseline-fallback",
          overallStatus: "stale",
          modules: {},
        },
        signals: [],
        readiness: [],
      }),
    );

    expect(markup).toContain("Hide trust details");
    expect(markup).toContain("aria-expanded=\"true\"");
    expect(markup).toContain("Current Run Trust Detail");
    expect(markup).toContain("Open assumptions");
    expect(markup).toContain("aria-controls");
  });
});
