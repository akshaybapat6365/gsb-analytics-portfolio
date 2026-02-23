import type { StarbucksPayload } from "@/lib/schemas/starbucks";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import { clampConfidenceBand } from "@/lib/decision-engines/types";

export function runStarbucksDecisionEngine(payload: StarbucksPayload): DecisionEngineResult {
  const totalDeltaProfitK = payload.stores.reduce((sum, store) => sum + store.deltaProfitK, 0);
  const totalDeltaProfit = totalDeltaProfitK * 1000;

  const recommendationCounts = payload.stores.reduce<Record<string, number>>((acc, store) => {
    acc[store.recommendation] = (acc[store.recommendation] ?? 0) + 1;
    return acc;
  }, {});

  const confidenceBand = clampConfidenceBand(0.56 + Math.min(0.24, Math.abs(payload.did.ate) * 0.4));

  return {
    recommendationId: "starbucks-portfolio-surgery",
    primaryMetric: {
      id: "portfolio_delta",
      label: "Portfolio Delta",
      value: totalDeltaProfit,
      unit: "usd",
    },
    counterfactualDelta: totalDeltaProfit,
    confidenceBand,
    drivers: ["WFH exposure", "segment mix", "DiD treatment effect"],
    kpis: [
      { id: "did_ate", label: "DiD ATE", value: payload.did.ate, unit: "pct" },
      {
        id: "convert_count",
        label: "Convert Recommendations",
        value: recommendationCounts.Convert ?? 0,
        unit: "count",
      },
      {
        id: "locker_count",
        label: "Locker Recommendations",
        value: recommendationCounts.Lockers ?? 0,
        unit: "count",
      },
      {
        id: "close_count",
        label: "Close Recommendations",
        value: recommendationCounts.Close ?? 0,
        unit: "count",
      },
    ],
  };
}
