"use client";

import { KpiCard } from "@/components/ui/KpiCard";
import { Slider } from "@/components/ui/Slider";
import { ActualVsAlgoTimeline } from "@/components/viz/ord-lga/ActualVsAlgoTimeline";
import { DecisionMemoPanel } from "@/components/viz/ord-lga/DecisionMemoPanel";
import { MarketPulseHero } from "@/components/viz/ord-lga/MarketPulseHero";
import { NashResponseSim } from "@/components/viz/ord-lga/NashResponseSim";
import { RegretHeatLattice } from "@/components/viz/ord-lga/RegretHeatLattice";
import { ShockEventStrip } from "@/components/viz/ord-lga/ShockEventStrip";
import { type PolicyViewMode } from "@/components/viz/ord-lga/transforms";
import { useOrdLgaScrollytelling } from "@/components/viz/ord-lga/useOrdLgaScrollytelling";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";

const MODE_OPTIONS: Array<{ id: PolicyViewMode; label: string }> = [
  { id: "observed", label: "Observed" },
  { id: "counterfactual", label: "Policy" },
  { id: "delta", label: "Delta" },
];

type ChapterProps = {
  chapter: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

function StoryChapter({ chapter, title, description, children }: ChapterProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="glass h-fit rounded-3xl p-5 xl:sticky xl:top-24">
        <p className="font-feature text-xs uppercase tracking-[0.22em] text-cyan-100/85">
          {chapter}
        </p>
        <h3 className="mt-3 font-display text-2xl leading-tight text-slate-50">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{description}</p>
      </aside>
      <div>{children}</div>
    </section>
  );
}

export default function PriceWarClient({ payload }: { payload: AirlinePayload }) {
  const {
    aggressiveness,
    setAggressiveness,
    competitorReactivity,
    setCompetitorReactivity,
    mode,
    setMode,
    shockReplay,
    setShockReplay,
    selectedIndex,
    setSelectedIndex,
    rows,
    summary,
    selectedDay,
    heat,
    shocks,
    bookingCurve,
    nash,
  } = useOrdLgaScrollytelling(payload);

  const competitorName = payload.competitor?.name ?? "Delta";
  const selectedSpread = selectedDay.competitorPrice - selectedDay.policyPrice;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="neo-panel h-fit p-5 xl:sticky xl:top-22">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cyan-200/85">
            Mission Controls
          </p>

          <div className="mt-5 space-y-4">
            <Slider
              label="UAL aggressiveness"
              value={aggressiveness}
              min={0}
              max={100}
              step={1}
              onChange={setAggressiveness}
              formatValue={(value) => `${value}%`}
            />
            <Slider
              label={`${competitorName} reactivity`}
              value={competitorReactivity}
              min={0}
              max={100}
              step={1}
              onChange={setCompetitorReactivity}
              formatValue={(value) => `${value}%`}
            />
          </div>

          <div className="mt-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Heat mode
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {MODE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMode(option.id)}
                  className={
                    mode === option.id
                      ? "rounded-full border border-cyan-300/35 bg-cyan-300/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100"
                      : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.08]"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShockReplay((curr) => !curr)}
            className={
              shockReplay
                ? "mt-5 w-full rounded-2xl border border-rose-300/35 bg-rose-300/15 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-rose-100"
                : "mt-5 w-full rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-slate-200 hover:bg-white/[0.09]"
            }
          >
            {shockReplay ? "Shock replay: on" : "Shock replay: off"}
          </button>

          <div className="mt-5 rounded-2xl border border-white/12 bg-black/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
              Selected Day
            </p>
            <p className="mt-2 font-mono text-base text-cyan-100">
              {selectedDay.date} · {selectedDay.dow}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Policy {formatUSD(selectedDay.policyPrice, { compact: false })} vs{" "}
              {competitorName}{" "}
              {formatUSD(selectedDay.competitorPrice, { compact: false })}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Spread:{" "}
              <span className={selectedSpread >= 0 ? "text-emerald-200" : "text-rose-200"}>
                {formatUSD(selectedSpread, { compact: false })}
              </span>
            </p>
          </div>
        </aside>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <KpiCard
              label="Incremental Revenue"
              value={formatUSD(summary.incrementalRevenue)}
              hint="Policy run-rate vs observed Q2"
              accent="emerald"
            />
            <KpiCard
              label="UAL Avg Share"
              value={formatPct(0.5 + summary.avgShareDelta, { digits: 1 })}
              hint={`${competitorName} response included`}
              accent="cyan"
            />
            <KpiCard
              label="Peak Regret Day"
              value={summary.peakRegretDay.date}
              hint={formatUSD(summary.peakRegretDay.policyRegret)}
              accent="amber"
            />
            <KpiCard
              label="Shock Intensity"
              value={selectedDay.shock > 0 ? formatNumber(selectedDay.shock, { digits: 2 }) : "0.00"}
              hint="Selected-day demand anomaly signal"
              accent={selectedDay.shock > 0 ? "crimson" : "cyan"}
            />
          </div>

          <div className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/[0.06] px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-200/90">
                Counterfactual Log
              </p>
            </div>
            <div className="space-y-2 px-5 py-4 text-sm text-slate-300">
              <p>
                {selectedDay.date}: policy fare{" "}
                <span className="text-cyan-100">
                  {formatUSD(selectedDay.policyPrice, { compact: false })}
                </span>{" "}
                vs observed{" "}
                <span className="text-slate-100">
                  {formatUSD(selectedDay.actualPrice, { compact: false })}
                </span>
                .
              </p>
              <p>
                Estimated delta:{" "}
                <span className={selectedDay.policyRegret >= 0 ? "text-emerald-200" : "text-rose-200"}>
                  {formatUSD(selectedDay.policyRegret)}
                </span>{" "}
                from {formatNumber(selectedDay.policyPax)} modeled passengers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <StoryChapter
        chapter="Chapter 0"
        title="Market pulse"
        description="Macro trajectory of fares and regret. Hover or click the chart to scrub each day and inspect policy behavior under competitor pressure."
      >
        <MarketPulseHero rows={rows} selectedIndex={selectedIndex} onSelectIndex={setSelectedIndex} />
      </StoryChapter>

      <StoryChapter
        chapter="Chapter A"
        title="Observed vs algorithmic path"
        description="The policy line reflects where an RL-guided desk likely would have priced after assimilating elasticity and rival behavior."
      >
        <ActualVsAlgoTimeline
          rows={rows}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
          bookingCurve={bookingCurve}
        />
      </StoryChapter>

      <StoryChapter
        chapter="Chapter B"
        title="Booking-window leakage map"
        description="Heat lattice shows where money leaks in the booking funnel. Switch between observed, policy, and delta surfaces."
      >
        <RegretHeatLattice
          mode={mode}
          bookingWindows={heat.bookingWindows}
          dows={heat.dows}
          cells={heat.cells}
          minValue={heat.min}
          maxValue={heat.max}
          activeDow={selectedDay.dow}
        />
      </StoryChapter>

      <StoryChapter
        chapter="Chapter C"
        title="Shock episodes"
        description="Click demand shock markers to jump to reaction days where pricing latency drove the largest regret clusters."
      >
        <ShockEventStrip
          events={shocks}
          totalDays={rows.length}
          selectedIndex={selectedIndex}
          onSelectIndex={setSelectedIndex}
        />
      </StoryChapter>

      <StoryChapter
        chapter="Chapter D"
        title="Competitive equilibrium"
        description={`Best-response path between United and ${competitorName}. Use control settings above to alter convergence speed and outcome quality.`}
      >
        <NashResponseSim states={nash.states} convergenceDay={nash.convergenceDay} />
      </StoryChapter>

      <StoryChapter
        chapter="Chapter E"
        title="Executive recommendation"
        description="BLUF conversion from simulation output to operating policy, including guardrails for shock days and competitor overreaction."
      >
        <DecisionMemoPanel
          summary={summary}
          selectedDay={selectedDay}
          competitorName={competitorName}
        />
      </StoryChapter>
    </div>
  );
}
