import { formatUSD } from "@/lib/metrics/format";
import type { EvPayload } from "@/lib/schemas/ev";
import { runEvDecisionEngine } from "@/lib/decision-engines/ev";

export function buildEvViewModel(payload: EvPayload) {
  const decision = runEvDecisionEngine(payload);

  return {
    value: formatUSD(decision.primaryMetric.value),
    valueLabel: decision.primaryMetric.label,
  };
}
