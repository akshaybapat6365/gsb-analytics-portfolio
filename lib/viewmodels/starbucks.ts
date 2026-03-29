import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import { clamp } from "@/lib/metrics/math";
import type { DecisionEvidence } from "@/lib/schemas/common";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";
import { runStarbucksDecisionEngine } from "@/lib/decision-engines/starbucks";

export const STARBUCKS_SEGMENTS = ["all", "office", "mixed", "residential"] as const;
export type StarbucksSegmentFilter = (typeof STARBUCKS_SEGMENTS)[number];

export type StarbucksScenarioArgs = {
  payload: StarbucksPayload;
  wfh: number;
  officeShock: number;
  segmentFilter: StarbucksSegmentFilter;
  selectedStoreId?: string;
  placeboMode?: boolean;
};

export type StarbucksDerivedStore = StarbucksPayload["stores"][number] & {
  traffic: number;
  profitK: number;
  confidence: number;
  trafficMultiplier: number;
  actionScore: number;
  actionReason: string;
  actionLabel: string;
};

function buildActionReason(store: StarbucksDerivedStore) {
  if (store.recommendation === "Convert") {
    return `${store.segment} node with ${formatPct(store.wfhExposure, { digits: 0 })} WFH exposure and ${formatUSD((store.profitK - store.baselineProfitK) * 1000)} projected uplift merits an immediate format conversion review.`;
  }

  if (store.recommendation === "Close") {
    return `${store.segment} node loses ${formatUSD(Math.abs(store.profitK - store.baselineProfitK) * 1000)} versus baseline under the active shock, so closure sequencing should stay visible.`;
  }

  return `${store.segment} node keeps enough residual traffic to justify lockers / pickup reconfiguration before a full conversion or exit.`;
}

function buildActionLabel(store: StarbucksDerivedStore) {
  if (store.recommendation === "Convert") return "Convert now";
  if (store.recommendation === "Close") return "Exit / relocate";
  return "Install lockers";
}

function buildRecommendationMix(stores: StarbucksDerivedStore[]) {
  return stores.reduce<Record<string, number>>((acc, store) => {
    acc[store.recommendation] = (acc[store.recommendation] ?? 0) + 1;
    return acc;
  }, {});
}

function buildDecisionEvidence(
  ranked: StarbucksDerivedStore[],
  selectedStore: StarbucksDerivedStore | undefined,
  payload: StarbucksPayload,
  totalDeltaProfitK: number,
  officeShock: number,
  placeboMode: boolean,
): DecisionEvidence[] {
  const topStores = ranked.slice(0, 3);

  if (topStores.length === 0) {
    return [];
  }

  return topStores.map((store, index) => ({
    recommendationId: `starbucks-${store.id}-${store.recommendation.toLowerCase()}-${index + 1}`,
    counterfactualDelta:
      `${store.name} ranks #${index + 1} with ${formatUSD((store.profitK - store.baselineProfitK) * 1000)} scenario delta; ` +
      `portfolio impact is ${formatUSD(totalDeltaProfitK * 1000)} under the active commuter assumptions.`,
    confidenceBand: [
      clamp(store.confidence - (placeboMode ? 0.18 : 0.08), 0.18, 0.96),
      clamp(store.confidence + (placeboMode ? 0.06 : 0.12), 0.24, 0.98),
    ],
    drivers: [
      `${store.segment} segment with ${formatPct(store.wfhExposure, { digits: 0 })} WFH exposure`,
      `${buildActionLabel(store)} backed by ${formatUSD((store.profitK - store.baselineProfitK) * 1000)} projected store delta`,
      selectedStore
        ? `Selected-store panel is pinned to ${selectedStore.name} so map selection and queue evidence stay synchronized`
        : "Map selection is unavailable",
      `DiD ATE ${formatPct(payload.did.ate, { digits: 0 })} with ${formatPct(payload.did.ci[0], { digits: 0 })} → ${formatPct(payload.did.ci[1], { digits: 0 })} interval${placeboMode ? " under placebo stress" : ""}`,
      `Office shock is set to ${formatNumber(officeShock * 100, { digits: 0 })}% for this scenario`,
    ],
  }));
}

export function deriveStarbucksScenario({
  payload,
  wfh,
  officeShock,
  segmentFilter,
  selectedStoreId,
  placeboMode = false,
}: StarbucksScenarioArgs) {
  const normalizedWfh = clamp(wfh / 100, 0, 1);
  const normalizedOfficeShock = clamp(officeShock / 100, 0, 1);

  const stores: StarbucksDerivedStore[] = payload.stores.map((store) => {
    const segmentShock =
      store.segment === "office"
        ? normalizedOfficeShock * 0.34
        : store.segment === "mixed"
          ? normalizedOfficeShock * 0.18
          : -normalizedOfficeShock * 0.08;
    const trafficMultiplier = clamp(
      1 - normalizedWfh * store.wfhExposure * 0.86 - segmentShock,
      0.34,
      1.3,
    );
    const traffic = store.baselineTraffic * trafficMultiplier;
    const profitK =
      store.baselineProfitK +
      store.deltaProfitK * normalizedWfh +
      (store.segment === "residential" ? 12 * normalizedOfficeShock : -10 * normalizedOfficeShock);
    const confidence = clamp(
      (Math.abs(store.deltaProfitK) / 120 + store.wfhExposure) / 2,
      0,
      1,
    );
    const deltaProfitK = profitK - store.baselineProfitK;
    const actionScore =
      deltaProfitK +
      (store.recommendation === "Convert" ? 14 : store.recommendation === "Lockers" ? 8 : -12) +
      store.wfhExposure * 18 +
      (store.segment === "office" ? normalizedOfficeShock * 18 : normalizedOfficeShock * 5);

    const derivedStore = {
      ...store,
      traffic,
      profitK,
      confidence,
      trafficMultiplier,
      actionScore,
      actionReason: "",
      actionLabel: "",
    };

    return {
      ...derivedStore,
      actionReason: buildActionReason(derivedStore),
      actionLabel: buildActionLabel(derivedStore),
    };
  });

  const visibleStores =
    segmentFilter === "all"
      ? stores
      : stores.filter((store) => store.segment === segmentFilter);

  const selectedStore =
    visibleStores.find((store) => store.id === selectedStoreId) ??
    stores.find((store) => store.id === selectedStoreId) ??
    visibleStores[0] ??
    stores[0];

  const recommendationMix = buildRecommendationMix(visibleStores);
  const totalDeltaProfitK = visibleStores.reduce(
    (sum, store) => sum + (store.profitK - store.baselineProfitK),
    0,
  );
  const avgTraffic =
    visibleStores.reduce((sum, store) => sum + store.traffic, 0) /
    Math.max(1, visibleStores.length);

  const segmentStats = ["office", "mixed", "residential"].map((segment) => {
    const rows = stores.filter((store) => store.segment === segment);
    const baselineTraffic = rows.reduce((sum, store) => sum + store.baselineTraffic, 0);
    const scenarioTraffic = rows.reduce((sum, store) => sum + store.traffic, 0);
    const baselineProfitK = rows.reduce((sum, store) => sum + store.baselineProfitK, 0);
    const scenarioProfitK = rows.reduce((sum, store) => sum + store.profitK, 0);
    return {
      segment,
      baselineTraffic,
      scenarioTraffic,
      baselineProfitK,
      scenarioProfitK,
    };
  });

  const ranked = [...visibleStores]
    .sort((a, b) => b.actionScore - a.actionScore)
    .slice(0, 10);
  const topPriorityStore = ranked[0];

  const scenarios = [...payload.scenarios].sort((a, b) => a.wfhIndex - b.wfhIndex);
  const treatmentSeries = scenarios.map((row) => {
    const base = row.trafficMultiplier;
    const shift = placeboMode ? 0.01 : normalizedOfficeShock * 0.18 + payload.did.ate * 0.15;
    return clamp(base - shift, 0.3, 1.35);
  });
  const controlSeries = scenarios.map((row) => {
    const base = row.trafficMultiplier;
    const shift = placeboMode ? 0.008 : normalizedOfficeShock * 0.06;
    return clamp(base - shift, 0.32, 1.35);
  });

  const divergenceSeries = treatmentSeries.map((value, idx) => value - controlSeries[idx]!);
  const ciBand = Math.max(0.01, (payload.did.ci[1] - payload.did.ci[0]) / 2);
  const evidence = buildDecisionEvidence(
    ranked,
    selectedStore,
    payload,
    totalDeltaProfitK,
    normalizedOfficeShock,
    placeboMode,
  );
  const selectedStoreDeltaProfitK = selectedStore ? selectedStore.profitK - selectedStore.baselineProfitK : 0;
  const queueSummary = topPriorityStore
    ? `${topPriorityStore.name} leads the queue with ${formatUSD((topPriorityStore.profitK - topPriorityStore.baselineProfitK) * 1000)} projected lift and ${formatPct(topPriorityStore.wfhExposure, { digits: 0 })} WFH exposure.`
    : "No stores available in the current filter.";
  const causalSummary = placeboMode
    ? `Placebo stress is on, so causal confidence is intentionally discounted even though the visible DiD interval remains ${formatPct(payload.did.ci[0], { digits: 0 })} → ${formatPct(payload.did.ci[1], { digits: 0 })}.`
    : `Recommendation confidence stays directional: DiD ATE is ${formatPct(payload.did.ate, { digits: 0 })} with ${formatPct(payload.did.ci[0], { digits: 0 })} → ${formatPct(payload.did.ci[1], { digits: 0 })} interval and pretrend p-value ${formatNumber(payload.did.pretrendP, { digits: 2 })}.`;

  return {
    w: normalizedWfh,
    office: normalizedOfficeShock,
    stores,
    visibleStores,
    recommendationMix,
    totalDeltaProfitK,
    avgTraffic,
    segmentStats,
    selectedStore,
    selectedStoreDeltaProfitK,
    ranked,
    topPriorityStore,
    scenarios,
    treatmentSeries,
    controlSeries,
    divergenceSeries,
    ciBand,
    evidence,
    queueSummary,
    causalSummary,
  };
}

export function buildStarbucksViewModel(payload: StarbucksPayload) {
  const decision = runStarbucksDecisionEngine(payload);
  return {
    value: formatUSD(decision.primaryMetric.value),
    valueLabel: decision.primaryMetric.label,
  };
}
