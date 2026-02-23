import { formatUSD } from "@/lib/metrics/format";
import type { ShrinkPayload } from "@/lib/schemas/shrink";
import { runShrinkDecisionEngine } from "@/lib/decision-engines/shrink";

export function buildShrinkViewModel(payload: ShrinkPayload) {
  const decision = runShrinkDecisionEngine(payload);

  return {
    value: formatUSD(decision.primaryMetric.value),
    valueLabel: decision.primaryMetric.label,
  };
}
