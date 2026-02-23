import type { EvPayload } from "@/lib/schemas/ev";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import { clampConfidenceBand } from "@/lib/decision-engines/types";

export function runEvDecisionEngine(payload: EvPayload): DecisionEngineResult {
  const sites = payload.candidateSites;
  const best = sites.reduce((winner, current) => (current.npvM > winner.npvM ? current : winner), sites[0]);
  const corridorNpvM = sites.reduce((sum, site) => sum + site.npvM, 0);
  const bestNpvUsd = (best?.npvM ?? 0) * 1_000_000;
  const corridorNpvUsd = corridorNpvM * 1_000_000;
  const buildable = sites.filter((site) => site.npvM >= 0).length;
  const confidenceBand = clampConfidenceBand(0.55 + Math.min(0.24, Math.max(0, corridorNpvM) * 0.03));

  return {
    recommendationId: "tesla-corridor-build-order",
    primaryMetric: {
      id: "best_site_npv",
      label: "Best Site NPV",
      value: bestNpvUsd,
      unit: "usd",
    },
    counterfactualDelta: corridorNpvUsd,
    confidenceBand,
    drivers: ["capture rate", "cannibalization", "capex intensity"],
    kpis: [
      { id: "best_site_npv", label: "Best Site NPV", value: bestNpvUsd, unit: "usd" },
      { id: "corridor_npv", label: "Corridor NPV", value: corridorNpvUsd, unit: "usd" },
      { id: "buildable_nodes", label: "Buildable Nodes", value: buildable, unit: "count" },
      { id: "total_nodes", label: "Total Candidate Nodes", value: sites.length, unit: "count" },
    ],
  };
}
