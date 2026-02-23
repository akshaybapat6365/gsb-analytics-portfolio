import type { NetflixPayload } from "@/lib/schemas/netflix";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import { clampConfidenceBand } from "@/lib/decision-engines/types";

export function runNetflixDecisionEngine(payload: NetflixPayload): DecisionEngineResult {
  const totalCostM = payload.titles.reduce((sum, title) => sum + title.costM, 0);
  const totalAcqM = payload.titles.reduce((sum, title) => sum + title.acquisitionLtvM, 0);
  const totalRetentionM = payload.titles.reduce((sum, title) => sum + title.retentionLtvM, 0);
  const netM = totalAcqM + totalRetentionM - totalCostM;
  const totalCost = totalCostM * 1_000_000;
  const totalLtv = (totalAcqM + totalRetentionM) * 1_000_000;
  const net = netM * 1_000_000;

  const confidenceBand = clampConfidenceBand(0.57 + Math.min(0.2, payload.headline.retentionLiftPct * 0.25));

  return {
    recommendationId: "netflix-content-allocation",
    primaryMetric: {
      id: "retention_lift",
      label: "Retention Lift",
      value: payload.headline.retentionLiftPct,
      unit: "pct",
    },
    counterfactualDelta: net,
    confidenceBand,
    drivers: ["retention LTV", "acquisition adds", "content cost efficiency"],
    kpis: [
      {
        id: "retention_lift",
        label: "Retention Lift",
        value: payload.headline.retentionLiftPct,
        unit: "pct",
      },
      { id: "total_cost", label: "Total Cost", value: totalCost, unit: "usd" },
      {
        id: "total_ltv",
        label: "Total LTV",
        value: totalLtv,
        unit: "usd",
      },
      { id: "net_value", label: "Net Value", value: net, unit: "usd" },
    ],
  };
}
