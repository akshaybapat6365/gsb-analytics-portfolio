"use client";

import { useMemo } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { DecisionConsole } from "@/components/story/DecisionConsole";
import { Chip } from "@/components/ui/Chip";
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
import { runAirlineDecisionEngine } from "@/lib/decision-engines/airline";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";

const MODE_OPTIONS: Array<{ id: PolicyViewMode; label: string }> = [
  { id: "observed", label: "Observed" },
  { id: "counterfactual", label: "Policy" },
  { id: "delta", label: "Delta" },
];

type ControlBlockProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

function ControlBlock({ title, subtitle, children }: ControlBlockProps) {
  return (
    <section className="surface-data p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function PriceWarClient({ payload }: { payload: AirlinePayload }) {
  const decision = useMemo(() => runAirlineDecisionEngine(payload), [payload]);
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
  const selectedShockLabel =
    selectedDay.shock > 0 ? formatNumber(selectedDay.shock, { digits: 2 }) : "0.00";
  const topAnnotations = (payload.annotations ?? []).slice(0, 4);
  const recommendationTier = (decision.recommendationTier ?? "balanced").toUpperCase();
  const recommendationTone =
    decision.recommendationTier === "aggressive"
      ? "emerald"
      : decision.recommendationTier === "defensive"
        ? "crimson"
        : "amber";

  return (
    <div className="space-y-6">
      <Reveal>
        <section className="surface-primary relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(680px_340px_at_12%_8%,rgba(126,52,34,0.24),transparent_66%),radial-gradient(760px_420px_at_88%_6%,rgba(162,124,74,0.18),transparent_68%)]" />
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Command Deck
              </p>
              <h3 className="mt-3 font-display text-3xl leading-tight text-slate-50 sm:text-4xl">
                Counterfactual Pricing Operations
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
                Stress-test pricing posture against {competitorName} response and demand shocks. Each control move updates the war-room telemetry and recommendation stack in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={recommendationTone}>{recommendationTier} posture</Chip>
              <Chip tone="neutral">Mode: {mode.toUpperCase()}</Chip>
              <Chip tone={selectedDay.shock > 0 ? "crimson" : "amber"}>
                Shock: {selectedShockLabel}
              </Chip>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.04}>
        <section className="grid gap-4 2xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:h-fit">
            <ControlBlock
              title="Policy Knobs"
              subtitle="Tune offensive posture and competitive responsiveness before running counterfactual outcomes."
            >
              <div className="space-y-4">
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
            </ControlBlock>

            <ControlBlock
              title="Visual Layer"
              subtitle="Switch between observed baseline, policy path, and delta leakage surfaces."
            >
              <div className="flex flex-wrap gap-2">
                {MODE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMode(option.id)}
                    className={
                      mode === option.id
                        ? "rounded-full border border-amber-300/35 bg-amber-300/14 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber-100"
                        : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.08]"
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShockReplay((curr) => !curr)}
                className={
                  shockReplay
                    ? "mt-4 w-full rounded-2xl border border-rose-300/35 bg-rose-300/15 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-rose-100"
                    : "mt-4 w-full rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-slate-200 hover:bg-white/[0.09]"
                }
              >
                {shockReplay ? "Shock replay: on" : "Shock replay: off"}
              </button>
            </ControlBlock>

            <ControlBlock
              title="Selected Day Intelligence"
              subtitle="Operational readout for the currently selected route-day state."
            >
              <div className="space-y-2 text-sm text-slate-300">
                <p className="font-mono text-base text-amber-100">
                  {selectedDay.date} · {selectedDay.dow}
                </p>
                <p>
                  Policy {formatUSD(selectedDay.policyPrice, { compact: false })} vs {competitorName}{" "}
                  {formatUSD(selectedDay.competitorPrice, { compact: false })}
                </p>
                <p>
                  Spread:{" "}
                  <span className={selectedSpread >= 0 ? "text-emerald-200" : "text-rose-200"}>
                    {formatUSD(selectedSpread, { compact: false })}
                  </span>
                </p>
                <p>
                  Revenue delta:{" "}
                  <span className={selectedDay.policyRegret >= 0 ? "text-emerald-200" : "text-rose-200"}>
                    {formatUSD(selectedDay.policyRegret)}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  Demand anomaly signal: <span className="font-mono text-slate-200">{selectedShockLabel}</span>
                </p>
              </div>
            </ControlBlock>

            <ControlBlock
              title="Evidence Feed"
              subtitle="Narrative evidence cards from the latest research annotations."
            >
              <div className="space-y-2">
                {topAnnotations.map((annotation) => (
                  <article key={annotation.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">
                      {annotation.timestampOrIndex}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-amber-100">
                      {annotation.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300">
                      {annotation.body}
                    </p>
                  </article>
                ))}
                {topAnnotations.length === 0 ? (
                  <p className="text-xs text-slate-400">No narrative annotations available in the current payload run.</p>
                ) : null}
              </div>
            </ControlBlock>
          </aside>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-12">
              <KpiCard
                className="2xl:col-span-4"
                label="Counterfactual Lift"
                value={formatUSD(summary.incrementalRevenue)}
                hint="Policy run-rate vs observed Q2"
                accent="emerald"
              />
              <KpiCard
                className="2xl:col-span-4"
                label="Risk-Adjusted Lift"
                value={formatUSD(decision.riskAdjustedLift ?? summary.incrementalRevenue)}
                hint={`${competitorName} response and guardrails applied`}
                accent="amber"
              />
              <KpiCard
                className="2xl:col-span-2"
                label="Peak Regret Day"
                value={summary.peakRegretDay.date}
                hint={formatUSD(summary.peakRegretDay.policyRegret)}
                accent="crimson"
              />
              <KpiCard
                className="2xl:col-span-2"
                label="UAL Avg Share"
                value={formatPct(0.5 + summary.avgShareDelta, { digits: 1 })}
                hint="Simulated average"
                accent="amber"
              />
            </div>

            <MarketPulseHero rows={rows} selectedIndex={selectedIndex} onSelectIndex={setSelectedIndex} />

            <DecisionConsole
              title="Decision Output Rail"
              lines={[
                {
                  label: "Quarterly counterfactual lift",
                  value: formatUSD(summary.incrementalRevenue),
                  tone: "emerald",
                },
                {
                  label: "Risk-adjusted expected lift",
                  value: formatUSD(decision.riskAdjustedLift ?? summary.incrementalRevenue),
                  tone: "amber",
                },
                {
                  label: "Selected-day tactical delta",
                  value: formatUSD(selectedDay.policyRegret),
                  tone: selectedDay.policyRegret >= 0 ? "emerald" : "crimson",
                },
                {
                  label: "Implied share edge (UAL vs DL)",
                  value: formatPct(selectedDay.uaShare - selectedDay.dlShare, { digits: 1 }),
                  tone: selectedDay.uaShare >= selectedDay.dlShare ? "amber" : "crimson",
                },
              ]}
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="surface-secondary p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Analytical Grid A
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Compare route-day trajectory and booking-window leakage to identify where the policy outperforms static desk reactions.
              </p>
            </div>
            <p className="metric-strip px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-100">
              chapter: trajectory + lattice
            </p>
          </div>
          <div className="chapter-divider mt-4" />
          <div className="mt-4 grid gap-4 2xl:grid-cols-2">
            <ActualVsAlgoTimeline
              rows={rows}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              bookingCurve={bookingCurve}
            />
            <RegretHeatLattice
              mode={mode}
              bookingWindows={heat.bookingWindows}
              dows={heat.dows}
              cells={heat.cells}
              minValue={heat.min}
              maxValue={heat.max}
              activeDow={selectedDay.dow}
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="surface-secondary p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Analytical Grid B
              </p>
              <p className="mt-2 text-sm text-slate-300">
                Stress episodes and equilibrium dynamics show where competitive lag compounds regret and where policy stabilizes outcomes.
              </p>
            </div>
            <p className="metric-strip px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-100">
              chapter: shocks + equilibrium
            </p>
          </div>
          <div className="chapter-divider mt-4" />
          <div className="mt-4 grid gap-4 2xl:grid-cols-2">
            <ShockEventStrip
              events={shocks}
              totalDays={rows.length}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
            />
            <NashResponseSim states={nash.states} convergenceDay={nash.convergenceDay} />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.16}>
        <DecisionMemoPanel
          summary={summary}
          selectedDay={selectedDay}
          competitorName={competitorName}
          decision={decision}
          payload={payload}
        />
      </Reveal>
    </div>
  );
}
