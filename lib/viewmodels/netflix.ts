import { formatPct, formatUSD } from "@/lib/metrics/format";
import type { NetflixPayload } from "@/lib/schemas/netflix";
import { runNetflixDecisionEngine } from "@/lib/decision-engines/netflix";

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
