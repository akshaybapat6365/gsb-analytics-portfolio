import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { DecisionEvidence } from "@/lib/schemas/common";
import type { ShrinkPayload } from "@/lib/schemas/shrink";
import { runShrinkDecisionEngine } from "@/lib/decision-engines/shrink";
import type { ShrinkEvidenceMode, ShrinkOperationalPosture } from "@/lib/viewmodels/shrinkScenario";

const SHRINK_RECOMMENDATION_EVIDENCE_IDS: Record<ShrinkOperationalPosture, string> = {
  observe: "shrink-observe-floor",
  detain: "shrink-targeted-detain",
  escalate: "shrink-escalate-response",
};

type BuildShrinkRecommendationContractArgs = {
  payload: ShrinkPayload;
  posture: ShrinkOperationalPosture;
  evidenceMode: ShrinkEvidenceMode;
  zoneName: string;
  threshold: number;
  queueCount: number;
  falsePositiveMultiplier: number;
  monthlyNet: number;
  monthlyRecovered: number;
  monthlyFalsePositive: number;
};

function clampConfidence(value: number) {
  return Math.min(0.98, Math.max(0.18, value));
}

function buildEvidenceDrivers(
  posture: ShrinkOperationalPosture,
  zoneName: string,
  queueCount: number,
  falsePositiveMultiplier: number,
) {
  const queueDriver =
    posture === "escalate"
      ? `${zoneName} trigger queue is sustaining ${queueCount} threshold-crossing incidents`
      : posture === "detain"
        ? `${zoneName} queue pressure remains elevated with ${queueCount} threshold-crossing incidents`
        : `${zoneName} queue pressure stays limited at ${queueCount} threshold-crossing incidents`;

  return [
    queueDriver,
    `current threshold is tuned against a ${falsePositiveMultiplier}% false-positive cost assumption`,
    `${zoneName} zone pressure anchors the current operational posture`,
  ];
}

export function buildShrinkRecommendationContract({
  payload,
  posture,
  evidenceMode,
  zoneName,
  threshold,
  queueCount,
  falsePositiveMultiplier,
  monthlyNet,
  monthlyRecovered,
  monthlyFalsePositive,
}: BuildShrinkRecommendationContractArgs) {
  const activeRecommendationId = SHRINK_RECOMMENDATION_EVIDENCE_IDS[posture];
  const baselineEvidenceId = payload.decisionEvidence?.[0]?.recommendationId ?? "shrink-threshold-policy";

  const recommendationLabel =
    posture === "escalate"
      ? "Escalate store-floor response"
      : posture === "detain"
        ? "Run targeted detain workflow"
        : "Observe with low-friction interventions";

  const confidenceFloor =
    evidenceMode === "degraded" ? 0.24 : evidenceMode === "sparse" ? 0.38 : 0.56;
  const confidenceCeiling =
    evidenceMode === "degraded" ? 0.48 : evidenceMode === "sparse" ? 0.68 : 0.82;
  const queueBoost = Math.min(0.12, queueCount * 0.015);
  const netDirectionBoost = monthlyNet >= 0 ? 0.08 : -0.02;
  const confidenceBand: [number, number] = [
    clampConfidence(confidenceFloor + queueBoost + netDirectionBoost),
    clampConfidence(confidenceCeiling + queueBoost + netDirectionBoost),
  ];

  const evidence: DecisionEvidence[] = [
    {
      recommendationId: activeRecommendationId,
      counterfactualDelta:
        posture === "escalate"
          ? `${formatUSD(monthlyNet)} monthly net after ${queueCount} threshold-crossing incidents justify active intervention in ${zoneName}`
          : posture === "detain"
            ? `${formatUSD(monthlyNet)} monthly net with ${queueCount} queued incidents supports targeted detains before broader escalation`
            : `${formatUSD(monthlyNet)} monthly net with only ${queueCount} queued incidents supports observe-first posture in ${zoneName}`,
      confidenceBand,
      drivers: buildEvidenceDrivers(posture, zoneName, queueCount, falsePositiveMultiplier),
    },
  ];

  const evidenceSummary =
    `${zoneName} at ${formatPct(threshold, { digits: 0 })} threshold currently resolves to "${recommendationLabel}". ` +
    `This evidence pack is generated from the active queue state, monthly economics (${formatUSD(monthlyRecovered)} recovered vs ${formatUSD(monthlyFalsePositive)} false-positive drag), and current trust posture rather than a single static payload row.`;

  const evidenceFooter =
    `Trust boundary: this panel shows recommendation-specific modeled evidence for the visible ${zoneName} / ${posture} / ${formatPct(threshold, { digits: 0 })} scenario. ` +
    `Static baseline context from ${baselineEvidenceId} remains part of the underlying payload lineage, but it is not presented as the live recommendation trace.`;

  return {
    activeRecommendationId,
    baselineEvidenceId,
    evidenceTitle: "Active Intervention Evidence",
    evidenceSummary,
    evidenceFooter,
    evidence,
  };
}

export function buildShrinkViewModel(payload: ShrinkPayload) {
  const decision = runShrinkDecisionEngine(payload);

  return {
    value: formatUSD(decision.primaryMetric.value),
    valueLabel: decision.primaryMetric.label,
  };
}
