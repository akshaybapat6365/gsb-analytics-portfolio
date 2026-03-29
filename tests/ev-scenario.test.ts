import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { deriveEvScenario } from "@/lib/viewmodels/ev";
import { EvPayloadSchema } from "@/lib/schemas/ev";

function loadPayload() {
  const abs = path.join(process.cwd(), "public", "data/ev/payload.json");
  const parsed = JSON.parse(fs.readFileSync(abs, "utf8")) as unknown;
  return EvPayloadSchema.parse(parsed);
}

describe("EV corridor scenario derivation", () => {
  it("keeps selected site, ranked outputs, and evidence synchronized under scenario changes", () => {
    const payload = loadPayload();

    const scenario = deriveEvScenario({
      payload,
      selectedSiteId: "harris",
      rangeAnxiety: 90,
      capexMultiplier: 88,
      competitorPressure: 12,
      nodeStates: {
        harris: "build",
        bakers: "hold",
        la: "abandon",
      },
    });

    expect(scenario.selectedSite.id).toBe("harris");
    expect(scenario.ranked[0]).toBeDefined();
    expect(scenario.recommendationEvidence.length).toBeGreaterThanOrEqual(3);
    expect(scenario.recommendationEvidence[0]?.drivers.join(" ")).toContain(scenario.selectedSite.name);
    expect(scenario.decisionSummary).toContain("Top build order");
  });

  it("reflects readiness posture and fallback messaging when evidence rows are sparse", () => {
    const payload = loadPayload();
    const sparsePayload = {
      ...payload,
      decisionEvidence: [],
      dataReadiness: payload.dataReadiness?.map((module, index) =>
        index === 0 ? { ...module, status: "partial" as const } : module,
      ),
    };

    const scenario = deriveEvScenario({
      payload: sparsePayload,
      selectedSiteId: "la",
      rangeAnxiety: 42,
      capexMultiplier: 124,
      competitorPressure: 68,
    });

    expect(scenario.evidenceMode).toBe("sparse");
    expect(scenario.recommendationEvidence).toHaveLength(0);
    expect(scenario.readinessSummary).toContain("strategic multipliers remain scenario inputs");
  });
});
