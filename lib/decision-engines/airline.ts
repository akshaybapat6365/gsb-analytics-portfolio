import type { AirlinePayload } from "@/lib/schemas/airline";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import { clampConfidenceBand } from "@/lib/decision-engines/types";

export function runAirlineDecisionEngine(payload: AirlinePayload): DecisionEngineResult {
  const actual = payload.days.reduce((sum, day) => sum + day.actual.revenue, 0);
  const algo = payload.days.reduce((sum, day) => sum + day.algo.revenue, 0);
  const counterfactualDelta = algo - actual;
  const avgRegret =
    payload.days.reduce((sum, day) => sum + day.regret, 0) / Math.max(1, payload.days.length);
  const shockRate =
    payload.days.filter((day) => day.shock > 0).length / Math.max(1, payload.days.length);
  const fallbackBand = clampConfidenceBand(0.62 + shockRate * 0.2);
  const revenueLiftCi = payload.uncertainty?.revenueLiftCi;
  const confidenceBand: [number, number] = revenueLiftCi
    ? (() => {
        const left = Math.max(
          0.1,
          Math.min(0.98, 0.5 + revenueLiftCi[0] / Math.max(1, Math.abs(counterfactualDelta) * 3)),
        );
        const right = Math.max(
          0.12,
          Math.min(0.99, 0.5 + revenueLiftCi[1] / Math.max(1, Math.abs(counterfactualDelta) * 3)),
        );
        return left <= right ? [left, right] : [right, left];
      })()
    : fallbackBand;

  const ciWidth = revenueLiftCi ? Math.abs(revenueLiftCi[1] - revenueLiftCi[0]) : Math.abs(counterfactualDelta) * 0.42;
  const uncertaintyPenalty = Math.max(0.0, Math.min(0.55, ciWidth / Math.max(1, Math.abs(counterfactualDelta) * 2.2)));
  const riskAdjustedLift = counterfactualDelta * (1 - uncertaintyPenalty);
  const policyMape = payload.validationSummary?.metrics.policyModel.mapeRevenue ?? 0.12;
  const lowerBound = revenueLiftCi?.[0] ?? riskAdjustedLift * 0.72;
  const recommendationTier =
    lowerBound > 0 && policyMape <= 0.1
      ? "aggressive"
      : riskAdjustedLift > 0
        ? "balanced"
        : "defensive";
  const policyGuardrails = [
    "Limit day-over-day fare moves to ±6% except shock override windows.",
    "Enable shock override when anomaly signal >= 0.7 and competitor undercut exceeds $12.",
    "Clamp competitor-reactivity coefficient to <= 0.65 to prevent oscillatory price wars.",
  ];

  return {
    recommendationId: "ord-price-policy",
    primaryMetric: {
      id: "counterfactual_revenue_lift",
      label: "Counterfactual Lift",
      value: counterfactualDelta,
      unit: "usd",
    },
    counterfactualDelta,
    confidenceBand,
    drivers: [
      "booking-window elasticity",
      "competitor response lag",
      "demand shock adaptation",
    ],
    kpis: [
      { id: "actual_revenue", label: "Observed Revenue", value: actual, unit: "usd" },
      { id: "algo_revenue", label: "Policy Revenue", value: algo, unit: "usd" },
      { id: "avg_regret", label: "Average Daily Regret", value: avgRegret, unit: "usd" },
      { id: "shock_rate", label: "Shock-Day Rate", value: shockRate, unit: "pct" },
    ],
    riskAdjustedLift,
    recommendationTier,
    policyGuardrails,
  };
}
