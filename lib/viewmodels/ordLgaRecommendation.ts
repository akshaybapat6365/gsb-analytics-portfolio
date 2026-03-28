import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import type { AirlinePayload } from "@/lib/schemas/airline";
import type { OrdSummary } from "@/components/viz/ord-lga/transforms";

export type OrdLgaRecommendationContract = {
  authoritativeLift: {
    label: string;
    value: number;
    formatted: string;
    hint: string;
  };
  riskAdjustedLift: {
    label: string;
    value: number;
    formatted: string;
    hint: string;
  };
  scenarioLift: {
    label: string;
    value: number;
    formatted: string;
    hint: string;
  };
  evidence: {
    title: string;
    summary: string;
    footer: string;
  };
};

export function buildOrdLgaRecommendationContract({
  payload,
  decision,
  summary,
}: {
  payload: AirlinePayload;
  decision: DecisionEngineResult;
  summary: OrdSummary;
}): OrdLgaRecommendationContract {
  const policyMape = payload.validationSummary?.metrics.policyModel.mapeRevenue ?? 0.12;
  const authoritativeLiftValue = decision.primaryMetric.value;
  const riskAdjustedLiftValue = decision.riskAdjustedLift ?? authoritativeLiftValue;
  const evidenceRecommendationId = payload.decisionEvidence?.[0]?.recommendationId ?? decision.recommendationId;

  return {
    authoritativeLift: {
      label: "Quarterly counterfactual lift",
      value: authoritativeLiftValue,
      formatted: formatUSD(authoritativeLiftValue),
      hint: "Default-baseline policy replay versus the observed desk; this is the canonical lift metric for the route.",
    },
    riskAdjustedLift: {
      label: "Risk-adjusted baseline expected lift",
      value: riskAdjustedLiftValue,
      formatted: formatUSD(riskAdjustedLiftValue),
      hint: `Baseline lift after uncertainty and model-error penalty, including current policy-model MAPE of ${formatPct(policyMape, { digits: 1 })}.`,
    },
    scenarioLift: {
      label: "Current scenario replay lift",
      value: summary.incrementalRevenue,
      formatted: formatUSD(summary.incrementalRevenue),
      hint: "Interactive sliders update this scenario-specific replay only; it is separate from the canonical baseline recommendation metric.",
    },
    evidence: {
      title: "Baseline Recommendation Evidence",
      summary:
        "Evidence rows below describe the default baseline recommendation package. Interactive sliders change the scenario replay metrics above, but they do not rewrite these evidence rows.",
      footer: `Showing static baseline evidence for ${evidenceRecommendationId}; use the scenario replay lift above for current slider state and the baseline evidence below for the underlying recommendation rationale.`,
    },
  };
}
