import type { ShrinkPayload } from "@/lib/schemas/shrink";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import { clampConfidenceBand } from "@/lib/decision-engines/types";

export function runShrinkDecisionEngine(payload: ShrinkPayload): DecisionEngineResult {
  const outcomes = payload.policy.outcomes;
  const best = outcomes.reduce((winner, current) =>
    current.roi > winner.roi ? current : winner,
  outcomes[0]);

  const expectedFalsePositiveCost =
    best.falsePositiveRate * payload.events.length * payload.economics.falsePositiveCost;
  const netValue = best.preventedLoss - expectedFalsePositiveCost;
  const confidenceBand = clampConfidenceBand(0.54 + Math.min(0.24, best.roi * 0.02));

  return {
    recommendationId: "shrink-threshold-policy",
    primaryMetric: {
      id: "best_prevented_loss",
      label: "Best Prevented Loss",
      value: best.preventedLoss,
      unit: "usd",
    },
    counterfactualDelta: netValue,
    confidenceBand,
    drivers: ["threshold calibration", "false-positive drag", "zone pressure"],
    kpis: [
      {
        id: "recommended_threshold",
        label: "Recommended Threshold",
        value: best.threshold,
        unit: "pct",
      },
      { id: "best_roi", label: "Best ROI", value: best.roi, unit: "mult" },
      { id: "net_value", label: "Expected Net Value", value: netValue, unit: "usd" },
      {
        id: "event_volume",
        label: "Event Volume",
        value: payload.events.length,
        unit: "count",
      },
    ],
  };
}
