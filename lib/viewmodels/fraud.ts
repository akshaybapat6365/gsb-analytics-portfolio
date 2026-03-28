import { formatPct } from "@/lib/metrics/format";
import type { DecisionEvidence } from "@/lib/schemas/common";
import type { FraudPayload } from "@/lib/schemas/fraud";
import { runFraudDecisionEngine } from "@/lib/decision-engines/fraud";

const FRAUD_RECOMMENDATION_EVIDENCE_IDS = {
  "Observe only": "fraud-observe-only",
  "Keep on watchlist": "fraud-watchlist-monitor",
  "Escalate forensic review": "fraud-escalate-review",
} as const;

export type FraudRecommendationLabel = keyof typeof FRAUD_RECOMMENDATION_EVIDENCE_IDS;

type BuildFraudRecommendationContractArgs = {
  payload: FraudPayload;
  recommendation: FraudRecommendationLabel;
  scenarioLabel: string;
  reviewPosture: string;
  selectedTicker: string;
  latestAdjustedRisk: number | null;
  triggerThreshold: number;
  topWatchlistTicker?: string | null;
  topWatchlistScore?: number | null;
  retainedLinkCount: number;
  linkCutoffPct: number;
  alphaBand: [number, number];
};

function pickEvidenceRow(payload: FraudPayload, recommendation: FraudRecommendationLabel): DecisionEvidence[] {
  const recommendationId = FRAUD_RECOMMENDATION_EVIDENCE_IDS[recommendation];
  const row = payload.decisionEvidence?.find((item) => item.recommendationId === recommendationId);
  return row ? [row] : [];
}

export function buildFraudRecommendationContract({
  payload,
  recommendation,
  scenarioLabel,
  reviewPosture,
  selectedTicker,
  latestAdjustedRisk,
  triggerThreshold,
  topWatchlistTicker,
  topWatchlistScore,
  retainedLinkCount,
  linkCutoffPct,
  alphaBand,
}: BuildFraudRecommendationContractArgs) {
  const evidence = pickEvidenceRow(payload, recommendation);
  const latestRiskLabel = latestAdjustedRisk === null ? "n/a" : formatPct(latestAdjustedRisk, { digits: 0 });
  const watchlistLabel =
    topWatchlistTicker && topWatchlistScore !== null && topWatchlistScore !== undefined
      ? `${topWatchlistTicker} at ${formatPct(topWatchlistScore, { digits: 0 })} adjusted risk`
      : "no watchlist leader available";

  return {
    activeRecommendationId: FRAUD_RECOMMENDATION_EVIDENCE_IDS[recommendation],
    evidenceTitle: "Active Triage Evidence Pack",
    evidenceSummary: `${selectedTicker} in ${scenarioLabel} currently resolves to \"${recommendation}\". This evidence pack is filtered to the active recommendation state and ties today’s posture to ${latestRiskLabel} adjusted risk, ${watchlistLabel}, and ${retainedLinkCount} retained similarity links at a ${linkCutoffPct}% cutoff.`,
    evidenceFooter:
      `Trust boundary: ${reviewPosture} Alpha range ${formatPct(alphaBand[0], { digits: 0 })} → ${formatPct(alphaBand[1], { digits: 0 })} and the ${formatPct(triggerThreshold, { digits: 0 })} trigger threshold remain modeled triage aids; they inform investigative posture but do not establish legal proof.`,
    evidence,
    boundedNotes: [
      `${scenarioLabel} keeps the posture ${reviewPosture.toLowerCase()}`,
      `${selectedTicker} currently prints ${latestRiskLabel} adjusted risk against a ${formatPct(triggerThreshold, { digits: 0 })} escalation threshold.`,
      `${retainedLinkCount} similarity links survive the current ${linkCutoffPct}% cutoff, so network density remains investigative context rather than standalone proof.`,
    ],
  };
}

export function buildFraudViewModel(payload: FraudPayload) {
  const decision = runFraudDecisionEngine(payload);

  return {
    value: formatPct(decision.primaryMetric.value, { digits: 0 }),
    valueLabel: decision.primaryMetric.label,
  };
}
