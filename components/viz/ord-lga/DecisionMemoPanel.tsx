"use client";

import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { OrdDerivedDay, OrdSummary } from "@/components/viz/ord-lga/transforms";
import type { DecisionEngineResult } from "@/lib/decision-engines/types";
import type { AirlinePayload } from "@/lib/schemas/airline";

type DecisionMemoPanelProps = {
  summary: OrdSummary;
  selectedDay: OrdDerivedDay;
  competitorName: string;
  decision: DecisionEngineResult;
  payload: AirlinePayload;
};

export function DecisionMemoPanel({
  summary,
  selectedDay,
  competitorName,
  decision,
  payload,
}: DecisionMemoPanelProps) {
  const marginBps = ((selectedDay.policyPrice - selectedDay.actualPrice) / Math.max(1, selectedDay.actualPrice)) * 10000;
  const shareGap = selectedDay.uaShare - selectedDay.dlShare;
  const liftCi = payload.uncertainty?.revenueLiftCi;
  const validationMape = payload.validationSummary?.metrics.policyModel.mapeRevenue;
  const bestAblation = payload.ablationSummary?.find((entry) => entry.scenario === "full_policy");
  const recommendationTone =
    decision.recommendationTier === "aggressive"
      ? "text-emerald-200"
      : decision.recommendationTier === "defensive"
        ? "text-rose-200"
        : "text-amber-200";

  return (
    <section
      className="terminal overflow-hidden rounded-3xl border border-amber-300/15"
      data-testid="decision-console"
    >
      <div className="border-b border-white/10 bg-amber-300/10 px-6 py-4">
        <p className="font-feature text-xs uppercase tracking-[0.2em] text-amber-100">
          Decision Memo
        </p>
      </div>

      <div className="space-y-4 px-6 py-6 text-sm text-slate-300">
        <p>
          <span className="text-slate-100">Business context:</span> {competitorName} reacted faster on shock days while the human desk held fares sticky.
        </p>
        <p>
          <span className="text-slate-100">Data insight:</span> policy simulation adds{" "}
          <span className="text-emerald-200">{formatUSD(summary.incrementalRevenue)}</span> over Q2 with average share
          edge of <span className="text-amber-200">{formatPct(0.5 + summary.avgShareDelta, { digits: 1 })}</span>.
        </p>
        <p>
          <span className="text-slate-100">Recommendation:</span> deploy{" "}
          <span className={recommendationTone}>
            {decision.recommendationTier ?? "balanced"}
          </span>{" "}
          policy posture with guardrails, anchored to risk-adjusted expected lift of{" "}
          <span className="text-emerald-200">
            {formatUSD(decision.riskAdjustedLift ?? summary.incrementalRevenue)}
          </span>.
        </p>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Selected day bps</p>
            <p className="mt-2 font-mono text-base text-amber-100">
              {formatNumber(marginBps, { digits: 0 })} bps
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Share gap (UAL-DL)</p>
            <p className={`mt-2 font-mono text-base ${shareGap >= 0 ? "text-emerald-200" : "text-rose-200"}`}>
              {formatPct(shareGap, { digits: 1 })}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Peak regret day</p>
            <p className="mt-2 font-mono text-base text-amber-200">{summary.peakRegretDay.date}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Policy MAPE</p>
            <p className="mt-2 font-mono text-base text-amber-100">
              {validationMape !== undefined
                ? formatPct(validationMape, { digits: 2 })
                : "n/a"}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">
            Uncertainty + robustness
          </p>
          <div className="mt-2 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <p>
              Lift CI:{" "}
              <span className="font-mono text-slate-100">
                {liftCi ? `${formatUSD(liftCi[0])} to ${formatUSD(liftCi[1])}` : "n/a"}
              </span>
            </p>
            <p>
              Full-policy ablation lift:{" "}
              <span className="font-mono text-slate-100">
                {bestAblation ? formatUSD(bestAblation.incrementalRevenue) : "n/a"}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300">Policy guardrails</p>
          <div className="mt-2 space-y-1.5 text-sm text-slate-200">
            {(decision.policyGuardrails ?? []).slice(0, 3).map((rule) => (
              <p key={rule}>- {rule}</p>
            ))}
            {(decision.policyGuardrails ?? []).length === 0 ? <p>Guardrails not available.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
