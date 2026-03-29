import { formatNumber, formatUSD } from "@/lib/metrics/format";
import { clamp } from "@/lib/metrics/math";
import type { ModuleReadiness, PayloadMeta, DecisionEvidence } from "@/lib/schemas/common";
import type { EvPayload } from "@/lib/schemas/ev";
import { runEvDecisionEngine } from "@/lib/decision-engines/ev";

export type EvNodeState = "build" | "hold" | "abandon";
export type EvEvidenceMode = "clear" | "sparse" | "degraded";

type EvScenarioArgs = {
  payload: EvPayload;
  selectedSiteId?: string;
  rangeAnxiety: number;
  capexMultiplier: number;
  competitorPressure: number;
  nodeStates?: Partial<Record<string, EvNodeState>>;
};

function resolveEvidenceMode(
  meta: PayloadMeta | undefined,
  readiness: ModuleReadiness[] | undefined,
  evidence: DecisionEvidence[] | undefined,
): EvEvidenceMode {
  const hasSparseEvidence = !evidence || evidence.length === 0;
  const hasBlockedModule = readiness?.some((module) => module.status === "blocked") ?? false;
  const hasPartialModule = readiness?.some((module) => module.status === "partial") ?? false;
  const overallStatus = meta?.overallStatus;

  if (overallStatus === "unavailable" || hasBlockedModule) {
    return "degraded";
  }

  if (overallStatus === "stale" || hasPartialModule || hasSparseEvidence) {
    return "sparse";
  }

  return "clear";
}

function defaultNodeState(site: EvPayload["candidateSites"][number]): EvNodeState {
  return site.npvM >= 0 ? "build" : "hold";
}

function buildRecommendationEvidence(
  ranked: Array<ReturnType<typeof deriveEvScenario>["adjustedSites"][number]>,
  selectedSite: ReturnType<typeof deriveEvScenario>["selectedSite"],
  evidenceMode: EvEvidenceMode,
  rangeAnxiety: number,
  capexMultiplier: number,
  competitorPressure: number,
): DecisionEvidence[] {
  if (evidenceMode !== "clear") {
    return [];
  }

  return ranked.slice(0, 3).map((site, index) => ({
    recommendationId: `tesla-${site.id}-${site.state}-${index + 1}`,
    counterfactualDelta:
      `${site.name} ranks #${index + 1} with ${formatUSD(site.adjustedNpvM * 1_000_000)} adjusted NPV while ` +
      `${formatNumber(site.capture, { digits: 0 })}% capture offsets ${formatNumber(site.cannibalization, { digits: 1 })} cannibalized units/mo.`,
    confidenceBand: [
      clamp(0.42 + site.capture / 180 - competitorPressure / 260, 0.18, 0.9),
      clamp(0.7 + site.capture / 140 - capexMultiplier / 500 + rangeAnxiety / 400, 0.28, 0.98),
    ],
    drivers: [
      `Selected-site panel is pinned to ${selectedSite.name} so node-state changes stay synchronized with the ranking output`,
      `${site.state.toUpperCase()} posture at ${site.name} with ${formatUSD(site.adjustedCapexM * 1_000_000)} adjusted capex`,
      `Strategic multipliers: range anxiety ${rangeAnxiety}%, capex ${capexMultiplier}%, competitor pressure ${competitorPressure}%`,
      `${formatNumber(site.capture, { digits: 0 })}% Ford capture vs ${formatNumber(site.cannibalization, { digits: 1 })} cannibalized Tesla units per month`,
    ],
  }));
}

export function deriveEvScenario({
  payload,
  selectedSiteId,
  rangeAnxiety,
  capexMultiplier,
  competitorPressure,
  nodeStates = {},
}: EvScenarioArgs) {
  const anxiety = clamp(rangeAnxiety / 100, 0, 1);
  const capexFactor = clamp(capexMultiplier / 100, 0.8, 1.45);
  const competitor = clamp(competitorPressure / 100, 0, 1);

  const adjustedSites = payload.candidateSites.map((site) => {
    const state = nodeStates[site.id] ?? defaultNodeState(site);
    const stateFactor = state === "build" ? 1 : state === "hold" ? 0.58 : 0.22;

    const capture = clamp(
      site.capturesFordPct * (0.78 + anxiety * 0.58) * (1 - competitor * 0.26) * stateFactor,
      2,
      96,
    );
    const cannibalization = clamp(
      site.cannibalizesTeslaUnitsPerMonth * (1 + competitor * 0.42) * (state === "abandon" ? 0.45 : 1),
      0,
      40,
    );
    const adjustedCapexM = site.capexM * capexFactor * (state === "build" ? 1 : state === "hold" ? 0.68 : 0.18);
    const captureLiftM = (capture - site.capturesFordPct) * 0.06;
    const cannibalDragM = (cannibalization - site.cannibalizesTeslaUnitsPerMonth) * 0.14;
    const capexDragM = adjustedCapexM - site.capexM;
    const statePenalty = state === "abandon" ? -site.capexM * 0.26 : 0;
    const adjustedNpvM = site.npvM + captureLiftM - cannibalDragM - capexDragM + statePenalty;

    return {
      ...site,
      state,
      capture,
      cannibalization,
      adjustedCapexM,
      adjustedNpvM,
    };
  });

  const selectedSite = adjustedSites.find((site) => site.id === selectedSiteId) ?? adjustedSites[0]!;
  const ranked = [...adjustedSites].sort((a, b) => b.adjustedNpvM - a.adjustedNpvM);

  const sensitivity = Array.from({ length: 9 }, (_, idx) => 0.78 + idx * 0.08).map((capex) => {
    const adjustedCapex = selectedSite.capexM * capex;
    const npv = selectedSite.adjustedNpvM - (adjustedCapex - selectedSite.adjustedCapexM);
    const downside = npv - (0.32 + competitor * 0.2);
    const upside = npv + (0.28 + anxiety * 0.22);
    return { capex, npv, downside, upside };
  });

  const corridorNpv = adjustedSites.reduce((sum, site) => sum + site.adjustedNpvM, 0);
  const buildCount = adjustedSites.filter((site) => site.state === "build").length;
  const utilizationForecast = clamp(0.48 + buildCount / Math.max(1, adjustedSites.length) * 0.42 + anxiety * 0.14, 0.2, 0.98);
  const downsideSummary = adjustedSites.filter((site) => site.adjustedNpvM < 0).length;
  const evidenceMode = resolveEvidenceMode(payload.meta, payload.dataReadiness, payload.decisionEvidence);
  const recommendationEvidence = buildRecommendationEvidence(
    ranked,
    selectedSite,
    evidenceMode,
    rangeAnxiety,
    capexMultiplier,
    competitorPressure,
  );
  const decisionSummary = ranked[0]
    ? `Top build order starts with ${ranked[0].name} while ${selectedSite.name} remains selected for drill-down under the active node-state posture.`
    : "No candidate nodes are available for the current corridor scenario.";
  const readinessSummary =
    evidenceMode === "degraded"
      ? "Readiness is degraded, so corridor outputs should be treated as fallback war-game guidance until real station and demand feeds recover."
      : evidenceMode === "sparse"
        ? "Evidence is sparse, so strategic multipliers remain scenario inputs and ranked build-order outputs should be treated as readiness-bounded decision aids."
        : `Strategic multipliers remain explicit: range anxiety ${rangeAnxiety}%, capex ${capexMultiplier}%, competitor pressure ${competitorPressure}%.`;

  return {
    anxiety,
    capexFactor,
    competitor,
    adjustedSites,
    selectedSite,
    ranked,
    sensitivity,
    corridorNpv,
    buildCount,
    utilizationForecast,
    downsideSummary,
    evidenceMode,
    recommendationEvidence,
    decisionSummary,
    readinessSummary,
  };
}

export function buildEvViewModel(payload: EvPayload) {
  const decision = runEvDecisionEngine(payload);

  return {
    value: formatUSD(decision.primaryMetric.value),
    valueLabel: decision.primaryMetric.label,
  };
}
