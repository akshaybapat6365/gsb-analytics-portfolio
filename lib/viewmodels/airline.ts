import { formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";
import { runAirlineDecisionEngine } from "@/lib/decision-engines/airline";

export function buildAirlineViewModel(payload: AirlinePayload) {
  const decision = runAirlineDecisionEngine(payload);

  return {
    value: formatUSD(decision.primaryMetric.value),
    valueLabel: decision.primaryMetric.label,
  };
}
