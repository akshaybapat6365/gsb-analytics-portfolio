import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { describe, expect, it } from "vitest";

import { AirlinePayloadSchema } from "@/lib/schemas/airline";
import { EvPayloadSchema } from "@/lib/schemas/ev";
import { FraudPayloadSchema } from "@/lib/schemas/fraud";
import { NetflixPayloadSchema } from "@/lib/schemas/netflix";
import { ShrinkPayloadSchema } from "@/lib/schemas/shrink";
import { StarbucksPayloadSchema } from "@/lib/schemas/starbucks";
import { runAirlineDecisionEngine } from "@/lib/decision-engines/airline";
import { runEvDecisionEngine } from "@/lib/decision-engines/ev";
import { runFraudDecisionEngine } from "@/lib/decision-engines/fraud";
import { runNetflixDecisionEngine } from "@/lib/decision-engines/netflix";
import { runShrinkDecisionEngine } from "@/lib/decision-engines/shrink";
import { runStarbucksDecisionEngine } from "@/lib/decision-engines/starbucks";

function loadPayload<TSchema extends z.ZodTypeAny>(relPath: string, schema: TSchema): z.infer<TSchema> {
  const abs = path.join(process.cwd(), "public", relPath);
  const parsed = JSON.parse(fs.readFileSync(abs, "utf8")) as unknown;
  return schema.parse(parsed);
}

describe("decision engines", () => {
  it("airline engine returns stable numeric outputs", () => {
    const payload = loadPayload("data/airline/payload.json", AirlinePayloadSchema);
    const result = runAirlineDecisionEngine(payload);

    expect(result.recommendationId).toBe("ord-price-policy");
    expect(Number.isFinite(result.primaryMetric.value)).toBe(true);
    expect(Number.isFinite(result.counterfactualDelta)).toBe(true);
    expect(result.riskAdjustedLift).toBeDefined();
    expect(result.recommendationTier).toMatch(/aggressive|balanced|defensive/);
    expect((result.policyGuardrails ?? []).length).toBeGreaterThan(0);
    expect(result.kpis.length).toBeGreaterThanOrEqual(4);
  });

  it("fraud engine returns bounded confidence and finite KPIs", () => {
    const payload = loadPayload("data/fraud/payload.json", FraudPayloadSchema);
    const result = runFraudDecisionEngine(payload);

    expect(result.confidenceBand[0]).toBeGreaterThanOrEqual(0.1);
    expect(result.confidenceBand[1]).toBeLessThanOrEqual(0.98);
    expect(result.confidenceBand[1]).toBeGreaterThanOrEqual(result.confidenceBand[0]);
    for (const kpi of result.kpis) {
      expect(Number.isFinite(kpi.value)).toBe(true);
    }
  });

  it("shrink engine computes finite ROI outputs", () => {
    const payload = loadPayload("data/shrink/payload.json", ShrinkPayloadSchema);
    const result = runShrinkDecisionEngine(payload);

    expect(result.recommendationId).toBe("shrink-threshold-policy");
    expect(result.kpis.some((kpi) => kpi.id === "best_roi")).toBe(true);
    expect(Number.isFinite(result.counterfactualDelta)).toBe(true);
  });

  it("starbucks engine normalizes portfolio delta to USD", () => {
    const payload = loadPayload("data/starbucks/payload.json", StarbucksPayloadSchema);
    const result = runStarbucksDecisionEngine(payload);

    expect(result.recommendationId).toBe("starbucks-portfolio-surgery");
    expect(result.primaryMetric.unit).toBe("usd");
    expect(Math.abs(result.primaryMetric.value)).toBeGreaterThan(1000);
  });

  it("ev engine emits site economics in USD", () => {
    const payload = loadPayload("data/ev/payload.json", EvPayloadSchema);
    const result = runEvDecisionEngine(payload);

    expect(result.recommendationId).toBe("tesla-corridor-build-order");
    expect(result.primaryMetric.unit).toBe("usd");
    expect(result.kpis.some((kpi) => kpi.id === "buildable_nodes")).toBe(true);
  });

  it("netflix engine returns net value and retention signal", () => {
    const payload = loadPayload("data/netflix/payload.json", NetflixPayloadSchema);
    const result = runNetflixDecisionEngine(payload);

    expect(result.recommendationId).toBe("netflix-content-allocation");
    expect(result.kpis.some((kpi) => kpi.id === "net_value")).toBe(true);
    expect(result.kpis.some((kpi) => kpi.id === "retention_lift")).toBe(true);
    expect(result.drivers.length).toBeGreaterThanOrEqual(3);
  });
});
