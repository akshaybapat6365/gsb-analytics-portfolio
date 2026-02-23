import { formatUSD } from "@/lib/metrics/format";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";
import { runStarbucksDecisionEngine } from "@/lib/decision-engines/starbucks";

export function buildStarbucksViewModel(payload: StarbucksPayload) {
  const decision = runStarbucksDecisionEngine(payload);
  return {
    value: formatUSD(decision.primaryMetric.value),
    valueLabel: decision.primaryMetric.label,
  };
}
