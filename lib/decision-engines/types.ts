export type DecisionEngineKpi = {
  id: string;
  label: string;
  value: number;
  unit?: "usd" | "pct" | "mult" | "count";
};

export type DecisionEngineResult = {
  recommendationId: string;
  primaryMetric: DecisionEngineKpi;
  confidenceBand: [number, number];
  drivers: string[];
  counterfactualDelta: number;
  kpis: DecisionEngineKpi[];
  riskAdjustedLift?: number;
  recommendationTier?: "aggressive" | "balanced" | "defensive";
  policyGuardrails?: string[];
};

export function clampConfidenceBand(base: number): [number, number] {
  const lo = Math.max(0.1, Math.min(0.9, base - 0.12));
  const hi = Math.max(lo, Math.min(0.98, base + 0.1));
  return [Number(lo.toFixed(2)), Number(hi.toFixed(2))];
}
