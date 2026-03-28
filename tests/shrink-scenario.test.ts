import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildShrinkRecommendationContract,
  buildShrinkRecommendationSurfaceModel,
} from "@/lib/viewmodels/shrink";
import { buildShrinkEventRef, deriveShrinkScenario } from "@/lib/viewmodels/shrinkScenario";
import { ShrinkPayloadSchema } from "@/lib/schemas/shrink";

function loadPayload() {
  const abs = path.join(process.cwd(), "public", "data/shrink/payload.json");
  return ShrinkPayloadSchema.parse(JSON.parse(fs.readFileSync(abs, "utf8")) as unknown);
}

describe("deriveShrinkScenario", () => {
  it("syncs selected event back to its zone and incident timeline", () => {
    const payload = loadPayload();
    const globalIndex = payload.events.findIndex((event) => event.zoneId === "z2" && event.t === 132);
    const event = payload.events[globalIndex]!;

    const scenario = deriveShrinkScenario(
      payload,
      0.85,
      100,
      payload.store.zones[0]?.id,
      buildShrinkEventRef(event, globalIndex),
    );

    expect(scenario.zone.id).toBe("z2");
    expect(scenario.selectedEvent?.t).toBe(132);
    expect(scenario.zoneEvents.some((zoneEvent) => zoneEvent.t === 132)).toBe(true);
    expect(scenario.eventCountsByZone.z2).toBeGreaterThan(0);
  });

  it("flags sparse evidence mode when decision evidence disappears", () => {
    const payload = loadPayload();
    const sparsePayload = {
      ...payload,
      decisionEvidence: [],
    };

    const scenario = deriveShrinkScenario(sparsePayload, 0.85, 100, payload.store.zones[0]?.id);

    expect(scenario.evidenceMode).toBe("sparse");
  });

  it("builds recommendation-specific evidence for the active posture instead of reusing the static payload row", () => {
    const payload = loadPayload();

    const observeScenario = deriveShrinkScenario(payload, 0.85, 100, "z4");
    const escalateScenario = deriveShrinkScenario(payload, 0.5, 100, "z2");

    const observeContract = buildShrinkRecommendationContract({
      payload,
      posture: observeScenario.posture,
      evidenceMode: observeScenario.evidenceMode,
      zoneName: observeScenario.zone.name,
      threshold: observeScenario.point.threshold,
      queueCount: observeScenario.zoneTriggered.length,
      falsePositiveMultiplier: 100,
      monthlyNet: observeScenario.monthlyNet,
      monthlyRecovered: observeScenario.monthlyRecovered,
      monthlyFalsePositive: observeScenario.monthlyFalsePositive,
    });

    const escalateContract = buildShrinkRecommendationContract({
      payload,
      posture: escalateScenario.posture,
      evidenceMode: escalateScenario.evidenceMode,
      zoneName: escalateScenario.zone.name,
      threshold: escalateScenario.point.threshold,
      queueCount: escalateScenario.zoneTriggered.length,
      falsePositiveMultiplier: 100,
      monthlyNet: escalateScenario.monthlyNet,
      monthlyRecovered: escalateScenario.monthlyRecovered,
      monthlyFalsePositive: escalateScenario.monthlyFalsePositive,
    });

    expect(observeContract.activeRecommendationId).toBe("shrink-observe-floor");
    expect(escalateContract.activeRecommendationId).toBe("shrink-escalate-response");
    expect(observeContract.evidence).toHaveLength(1);
    expect(escalateContract.evidence).toHaveLength(1);
    expect(observeContract.evidence[0]?.recommendationId).not.toBe(payload.decisionEvidence?.[0]?.recommendationId);
    expect(escalateContract.evidence[0]?.recommendationId).not.toBe(payload.decisionEvidence?.[0]?.recommendationId);
    expect(observeContract.evidenceSummary).toContain("static payload row");
    expect(escalateContract.evidenceFooter).toContain("not presented as the live recommendation trace");
  });

  it("labels unchanged recommendations honestly when the false-positive assumption moves but the argmax does not", () => {
    const payload = loadPayload();
    const baselineThreshold = deriveShrinkScenario(payload, 0.85, 100, payload.store.zones[0]?.id).recommended.threshold;
    const scenario = deriveShrinkScenario(payload, 0.85, 150, payload.store.zones[0]?.id);

    const surface = buildShrinkRecommendationSurfaceModel({
      currentThreshold: scenario.point.threshold,
      falsePositiveMultiplier: 150,
      recommendedThreshold: scenario.recommended.threshold,
      recommendedNetValue: scenario.recommended.recoveredNet,
      currentNetValue: scenario.expectedNetValue,
      baselineRecommendedThreshold: baselineThreshold,
    });

    expect(surface.recommendedThresholdLabel).toBe("85%");
    expect(surface.recommendationShifted).toBe(false);
    expect(surface.recommendationHint).toContain("remains the frontier argmax even at 150% false-positive cost");
    expect(surface.recommendationHint).toContain("Economics moved");
    expect(surface.recommendationBadge).toBe("Unchanged recommendation, economics recomputed");
  });
});
