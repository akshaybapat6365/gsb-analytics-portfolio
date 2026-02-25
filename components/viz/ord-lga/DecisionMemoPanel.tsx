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
  const recommendationColor =
    decision.recommendationTier === "aggressive"
      ? "var(--radar-green)"
      : decision.recommendationTier === "defensive"
        ? "var(--radar-crimson)"
        : "var(--radar-amber)";

  return (
    <section className="radar-panel overflow-hidden">
      {/* Header stripe */}
      <div
        className="px-6 py-4"
        style={{
          borderBottom: "1px solid var(--radar-border)",
          background: "var(--radar-amber-08)",
        }}
      >
        <p className="radar-eyebrow">Decision Memo</p>
      </div>

      <div className="space-y-4 px-6 py-6 text-[13px] text-slate-300">
        <p>
          <span className="text-slate-100">Business context:</span> {competitorName} reacted faster on shock days while the human desk held fares sticky.
        </p>
        <p>
          <span className="text-slate-100">Data insight:</span> policy simulation adds{" "}
          <span style={{ color: "var(--radar-green)" }}>{formatUSD(summary.incrementalRevenue)}</span> over Q2 with average share
          edge of <span style={{ color: "var(--radar-amber)" }}>{formatPct(0.5 + summary.avgShareDelta, { digits: 1 })}</span>.
        </p>
        <p>
          <span className="text-slate-100">Recommendation:</span> deploy{" "}
          <span style={{ color: recommendationColor }}>
            {decision.recommendationTier ?? "balanced"}
          </span>{" "}
          policy posture with guardrails, anchored to risk-adjusted expected lift of{" "}
          <span style={{ color: "var(--radar-green)" }}>
            {formatUSD(decision.riskAdjustedLift ?? summary.incrementalRevenue)}
          </span>.
        </p>

        {/* KPI grid */}
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="radar-kpi">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">Selected day bps</p>
            <p className="mt-1 font-mono text-base" style={{ color: "var(--radar-amber)" }}>
              {formatNumber(marginBps, { digits: 0 })} bps
            </p>
          </div>
          <div className="radar-kpi">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">Share gap (UAL-DL)</p>
            <p className="mt-1 font-mono text-base" style={{ color: shareGap >= 0 ? "var(--radar-green)" : "var(--radar-crimson)" }}>
              {formatPct(shareGap, { digits: 1 })}
            </p>
          </div>
          <div className="radar-kpi">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">Peak regret day</p>
            <p className="mt-1 font-mono text-base" style={{ color: "var(--radar-amber)" }}>{summary.peakRegretDay.date}</p>
          </div>
          <div className="radar-kpi">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">Policy MAPE</p>
            <p className="mt-1 font-mono text-base" style={{ color: "var(--radar-amber)" }}>
              {validationMape !== undefined ? formatPct(validationMape, { digits: 2 }) : "n/a"}
            </p>
          </div>
        </div>

        {/* Uncertainty + Robustness */}
        <div className="radar-kpi">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
            Uncertainty + Robustness
          </p>
          <div className="mt-2 grid gap-2 text-[12px] text-slate-300 sm:grid-cols-2">
            <p>
              Lift CI:{" "}
              <span className="font-mono text-slate-200">
                {liftCi ? `${formatUSD(liftCi[0])} to ${formatUSD(liftCi[1])}` : "n/a"}
              </span>
            </p>
            <p>
              Full-policy ablation lift:{" "}
              <span className="font-mono text-slate-200">
                {bestAblation ? formatUSD(bestAblation.incrementalRevenue) : "n/a"}
              </span>
            </p>
          </div>
        </div>

        {/* Policy guardrails */}
        <div className="radar-kpi">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">Policy guardrails</p>
          <div className="mt-2 space-y-1.5 text-[12px] text-slate-300">
            {(decision.policyGuardrails ?? []).slice(0, 3).map((rule) => (
              <p key={rule}>– {rule}</p>
            ))}
            {(decision.policyGuardrails ?? []).length === 0 ? <p className="text-slate-500">Guardrails not available.</p> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
