import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { runAirlineDecisionEngine } from "@/lib/decision-engines/airline";
import { AirlinePayloadSchema } from "@/lib/schemas/airline";
import { buildOrdLgaRecommendationContract } from "@/lib/viewmodels/ordLgaRecommendation";
import { derivePolicyDays, summarizeRows } from "@/components/viz/ord-lga/transforms";

function loadAirlinePayload() {
  const abs = path.join(process.cwd(), "public", "data/airline/payload.json");
  return AirlinePayloadSchema.parse(JSON.parse(fs.readFileSync(abs, "utf8")) as unknown);
}

describe("ORD-LGA recommendation contract", () => {
  it("keeps one authoritative quarterly lift and labels scenario replay separately", () => {
    const payload = loadAirlinePayload();
    const decision = runAirlineDecisionEngine(payload);
    const summary = summarizeRows(derivePolicyDays(payload, 64, 58));

    const contract = buildOrdLgaRecommendationContract({ payload, decision, summary });

    expect(contract.authoritativeLift.label).toBe("Quarterly counterfactual lift");
    expect(contract.authoritativeLift.value).toBe(decision.primaryMetric.value);
    expect(contract.authoritativeLift.value).not.toBe(summary.incrementalRevenue);
    expect(contract.scenarioLift.label).toBe("Current scenario replay lift");
    expect(contract.scenarioLift.value).toBe(summary.incrementalRevenue);
    expect(contract.riskAdjustedLift.label).toBe("Risk-adjusted baseline expected lift");
  });

  it("marks evidence as baseline and warns that sliders do not rewrite evidence rows", () => {
    const payload = loadAirlinePayload();
    const decision = runAirlineDecisionEngine(payload);
    const summary = summarizeRows(derivePolicyDays(payload, 82, 24));

    const contract = buildOrdLgaRecommendationContract({ payload, decision, summary });

    expect(contract.evidence.title).toBe("Baseline Recommendation Evidence");
    expect(contract.evidence.summary).toContain("default baseline");
    expect(contract.evidence.summary).toContain("sliders");
    expect(contract.evidence.footer).toContain("static baseline evidence");
    expect(contract.evidence.footer).toContain(payload.decisionEvidence?.[0]?.recommendationId ?? "ord-price-policy");
  });
});
