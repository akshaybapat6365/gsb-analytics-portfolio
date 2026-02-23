import type { FraudPayload } from "@/lib/schemas/fraud";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import { clampConfidenceBand } from "@/lib/decision-engines/types";

export function runFraudDecisionEngine(payload: FraudPayload): DecisionEngineResult {
  const topRisk = payload.filings.reduce((max, filing) => Math.max(max, filing.riskScore), 0);
  const avgRisk =
    payload.filings.reduce((sum, filing) => sum + filing.riskScore, 0) /
    Math.max(1, payload.filings.length);
  const avgDeception =
    payload.filings.reduce((sum, filing) => sum + filing.deception, 0) /
    Math.max(1, payload.filings.length);
  const alpha = payload.backtest.annualizedAlpha;
  const confidenceBand = clampConfidenceBand(0.58 + Math.min(0.2, avgDeception * 0.15));

  return {
    recommendationId: "fraud-short-basket",
    primaryMetric: {
      id: "peak_risk",
      label: "Peak Risk",
      value: topRisk,
      unit: "pct",
    },
    counterfactualDelta: alpha,
    confidenceBand,
    drivers: [
      "beneish drift",
      "deception marker acceleration",
      "similarity cluster proximity",
    ],
    kpis: [
      { id: "peak_risk", label: "Peak Risk", value: topRisk, unit: "pct" },
      { id: "avg_risk", label: "Average Risk", value: avgRisk, unit: "pct" },
      { id: "avg_deception", label: "Average Deception", value: avgDeception, unit: "pct" },
      { id: "alpha", label: "Backtested Alpha", value: alpha, unit: "pct" },
    ],
  };
}
