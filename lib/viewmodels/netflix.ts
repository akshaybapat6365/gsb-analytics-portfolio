import { formatPct, formatUSD } from "@/lib/metrics/format";
import { clamp } from "@/lib/metrics/math";
import type { DecisionEvidence } from "@/lib/schemas/common";
import type { NetflixPayload } from "@/lib/schemas/netflix";
import { runNetflixDecisionEngine } from "@/lib/decision-engines/netflix";

export type NetflixScenarioInputs = {
  budgetM: number;
  buzz: number;
  acclaim: number;
  retentionPriority: number;
  buzzDecay: number;
  selectedTitleId?: string;
};

function buildNetflixRecommendationEvidence(payload: NetflixPayload, selectedTitleTitle: string): DecisionEvidence[] {
  const evidence = payload.decisionEvidence ?? [];

  return evidence.map((item) => ({
    ...item,
    recommendationId: `${item.recommendationId}:${selectedTitleTitle}`,
  }));
}

export function deriveNetflixScenario(payload: NetflixPayload, inputs: NetflixScenarioInputs) {
  const budget = clamp(inputs.budgetM, 5, 250);
  const buzzNorm = clamp(inputs.buzz / 100, 0, 1);
  const acclaimNorm = clamp(inputs.acclaim / 100, 0, 1);
  const retentionWeight = clamp(inputs.retentionPriority / 100, 0, 1);
  const acquisitionWeight = 1 - retentionWeight;
  const decay = clamp(inputs.buzzDecay / 100, 0, 1);

  const adds =
    payload.model.acquisitionAddsCoeff.intercept +
    payload.model.acquisitionAddsCoeff.budget * budget +
    payload.model.acquisitionAddsCoeff.buzz * buzzNorm * (1 - decay * 0.3) +
    payload.model.acquisitionAddsCoeff.acclaim * acclaimNorm;

  const retentionMonths =
    payload.model.retentionMonthsCoeff.intercept +
    payload.model.retentionMonthsCoeff.budget * budget * (0.85 + retentionWeight * 0.35) +
    payload.model.retentionMonthsCoeff.buzz * buzzNorm * (1 - decay * 0.45) +
    payload.model.retentionMonthsCoeff.acclaim * acclaimNorm;

  const weightedTitles = payload.titles.map((title) => {
    const weightedLtv = title.acquisitionLtvM * acquisitionWeight + title.retentionLtvM * retentionWeight;
    const weightedRoi = weightedLtv / Math.max(1, title.costM);
    const acquisitionShare = title.acquisitionLtvM / Math.max(1, title.acquisitionLtvM + title.retentionLtvM);
    const retentionShare = title.retentionLtvM / Math.max(1, title.acquisitionLtvM + title.retentionLtvM);
    const committeeSpread = (retentionShare - acquisitionShare) * 100;
    const paybackMonths = clamp((title.costM / Math.max(1, weightedLtv)) * 14, 2, 36);
    const budgetSharePct = (title.costM / Math.max(1, budget)) * 100;
    const committeeBias =
      committeeSpread >= 8
        ? "retention-weighted"
        : committeeSpread <= -8
          ? "acquisition-weighted"
          : "balanced";

    return {
      ...title,
      weightedLtv,
      weightedRoi,
      paybackMonths,
      acquisitionShare,
      retentionShare,
      committeeSpread,
      budgetSharePct,
      committeeBias,
    };
  });

  const ranked = [...weightedTitles].sort((a, b) => {
    if (b.weightedRoi !== a.weightedRoi) return b.weightedRoi - a.weightedRoi;
    if (b.retentionShare !== a.retentionShare) return b.retentionShare - a.retentionShare;
    return a.costM - b.costM;
  });

  const top = ranked[0] ?? weightedTitles[0];
  const selectedTitle = weightedTitles.find((title) => title.id === inputs.selectedTitleId) ?? top;
  const selectedRank = Math.max(
    1,
    ranked.findIndex((title) => title.id === selectedTitle.id) + 1,
  );
  const selectedVsTopPct = top ? ((selectedTitle.weightedRoi / Math.max(0.01, top.weightedRoi)) * 100) : 100;

  const buzzTimeline = Array.from({ length: 12 }, (_, idx) => {
    const week = idx + 1;
    const baseline = buzzNorm * Math.exp(-decay * 0.22 * idx);
    const momentum = acclaimNorm * 0.12 * Math.exp(-0.08 * idx);
    return {
      week,
      buzz: clamp((baseline + momentum) * 100, 0, 100),
    };
  });

  const greenlightScore = clamp(
    (Math.max(0, adds) * 0.22 + Math.max(0, retentionMonths) * 0.78) / 10,
    0,
    100,
  );

  const selectedFrontierPoint: [number, number] = [
    clamp(selectedTitle.acquisitionLtvM * (0.72 + buzzNorm * 0.22), 0, 220),
    clamp(selectedTitle.retentionLtvM * (0.8 + retentionWeight * 0.26), 0, 220),
  ];

  const stressCards = [
    {
      id: "base",
      label: "Base",
      addsM: Math.max(0, adds),
      retention: Math.max(0, retentionMonths),
    },
    {
      id: "upside",
      label: "Upside",
      addsM: Math.max(0, adds * 1.16),
      retention: Math.max(0, retentionMonths * 1.14),
    },
    {
      id: "downside",
      label: "Downside",
      addsM: Math.max(0, adds * 0.78),
      retention: Math.max(0, retentionMonths * 0.72),
    },
  ];

  const allocationRecommendation =
    selectedTitle.weightedRoi >= 8
      ? "greenlight and overweight"
      : selectedTitle.weightedRoi >= 4.5
        ? "greenlight with spend guardrails"
        : "hold or rework concept";

  const capitalLane =
    selectedTitle.budgetSharePct <= 12
      ? "scalable"
      : selectedTitle.budgetSharePct <= 24
        ? "mid-slate"
        : "capital intensive";

  const committeeLens =
    retentionWeight >= 0.65
      ? "retention-led"
      : retentionWeight <= 0.35
        ? "acquisition-led"
        : "balanced slate";

  const recommendationHeadline = `${selectedTitle.title} is a ${selectedRank <= 3 ? "top-tier" : "conditional"} ${committeeLens} greenlight under the current committee lens.`;
  const recommendationRationale = `${selectedTitle.title} ranks #${selectedRank} on weighted ROI at ${selectedTitle.weightedRoi.toFixed(2)}x, with ${selectedTitle.retentionShare > selectedTitle.acquisitionShare ? "retention durability" : "acquisition pull"} contributing most of the modeled value mix.`;
  const recommendationFootnote = `Modeled title economics combine synthetic slate values with live readiness metadata. Use this packet to compare scenarios, not to claim observed causal truth.`;

  const evidenceSummary = `${selectedTitle.title} currently ranks #${selectedRank} with a ${selectedTitle.committeeBias} value mix, ${formatUSD(selectedTitle.weightedLtv * 1_000_000)} modeled weighted LTV, ${selectedTitle.paybackMonths.toFixed(1)} month payback, and ${selectedVsTopPct.toFixed(0)}% of the current top-title ROI.`;
  const evidenceFooter = `Trust boundary: predicted adds, retention months, and title-level payback remain modeled committee aids under a ${committeeLens} scenario. Real feed readiness informs confidence, but title economics are still synthetic.`;

  const recommendationContract = {
    evidenceTitle: "Active Committee Evidence Pack",
    evidenceSummary,
    evidenceFooter,
    boundedNotes: [
      `${committeeLens} weighting currently sets acquisition / retention emphasis at ${Math.round(acquisitionWeight * 100)}% / ${Math.round(retentionWeight * 100)}%.`,
      `${selectedTitle.title} consumes ${selectedTitle.budgetSharePct.toFixed(0)}% of the active budget envelope, placing it in the ${capitalLane} capital lane.`,
      `Buzz decay at ${Math.round(decay * 100)}% can still compress the modeled payback curve before observed subscriber data arrives.`,
    ],
    evidence: buildNetflixRecommendationEvidence(payload, selectedTitle.title),
  };

  const decisionPacket = {
    recommendationHeadline,
    recommendationRationale,
    recommendationFootnote,
    capitalLane,
    committeeLens,
    selectedRank,
    selectedVsTopPct,
  };

  return {
    budget,
    buzzNorm,
    acclaimNorm,
    retentionWeight,
    acquisitionWeight,
    decay,
    predictedAddsM: Math.max(0, adds),
    predictedRetentionMonths: Math.max(0, retentionMonths),
    weightedTitles,
    ranked: ranked.slice(0, 10),
    top,
    selectedTitle,
    selectedRank,
    selectedVsTopPct,
    buzzTimeline,
    greenlightScore,
    selectedFrontierPoint,
    stressCards,
    allocationRecommendation,
    decisionPacket,
    recommendationContract,
  };
}

export function buildNetflixViewModel(payload: NetflixPayload) {
  const decision = runNetflixDecisionEngine(payload);
  const unit = decision.primaryMetric.unit;
  const value =
    unit === "usd"
      ? formatUSD(decision.primaryMetric.value)
      : unit === "pct"
        ? formatPct(decision.primaryMetric.value, { digits: 1 })
        : String(decision.primaryMetric.value);

  return {
    value,
    valueLabel: decision.primaryMetric.label,
  };
}
