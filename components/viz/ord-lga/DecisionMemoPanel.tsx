"use client";

import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { OrdDerivedDay, OrdSummary } from "@/components/viz/ord-lga/transforms";

type DecisionMemoPanelProps = {
  summary: OrdSummary;
  selectedDay: OrdDerivedDay;
  competitorName: string;
};

export function DecisionMemoPanel({
  summary,
  selectedDay,
  competitorName,
}: DecisionMemoPanelProps) {
  const marginBps = ((selectedDay.policyPrice - selectedDay.actualPrice) / Math.max(1, selectedDay.actualPrice)) * 10000;
  const shareGap = selectedDay.uaShare - selectedDay.dlShare;

  return (
    <section className="terminal overflow-hidden rounded-3xl border border-cyan-300/15">
      <div className="border-b border-white/10 bg-cyan-300/10 px-6 py-4">
        <p className="font-feature text-xs uppercase tracking-[0.2em] text-cyan-100">
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
          edge of <span className="text-cyan-200">{formatPct(0.5 + summary.avgShareDelta, { digits: 1 })}</span>.
        </p>
        <p>
          <span className="text-slate-100">Recommendation:</span> run an RL-assisted pricing band with shock override and competitor reaction guardrails.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
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
            <p className="mt-2 font-mono text-base text-cyan-200">{summary.peakRegretDay.date}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
