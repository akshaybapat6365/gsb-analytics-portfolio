import { formatPct } from "@/lib/metrics/format";
import type { FraudPayload } from "@/lib/schemas/fraud";
import { runFraudDecisionEngine } from "@/lib/decision-engines/fraud";

export function buildFraudViewModel(payload: FraudPayload) {
  const decision = runFraudDecisionEngine(payload);

  return {
    value: formatPct(decision.primaryMetric.value, { digits: 0 }),
    valueLabel: decision.primaryMetric.label,
  };
}
