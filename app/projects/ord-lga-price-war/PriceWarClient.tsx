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
import { SensitivityContour } from "@/components/viz/ord-lga/SensitivityContour";
import { AblationWaterfall } from "@/components/viz/ord-lga/AblationWaterfall";
import { BookingCascade } from "@/components/viz/ord-lga/BookingCascade";
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

/* ─── Chapter Header ─── */
function ChapterHeader({
  number,
  title,
  subtitle,
  badge,
}: {
  number: string;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="radar-eyebrow">{number}</p>
        <h3
          className="radar-heading mt-2 text-[26px] sm:text-[32px]"
        >
          {title}
        </h3>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-slate-400">
          {subtitle}
        </p>
      </div>
      {badge && (
        <span
          className="rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]"
          style={{
            borderColor: "var(--radar-amber-20)",
            color: "var(--radar-amber)",
            background: "var(--radar-amber-08)",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ─── Control Block (sidebar) ─── */
function ControlBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="radar-panel p-4">
      <p className="radar-eyebrow">{title}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{subtitle}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* ═══════ Main Component ═══════ */
export default function PriceWarClient({
  payload,
}: {
  payload: AirlinePayload;
}) {
  const decision = useMemo(
    () => runAirlineDecisionEngine(payload),
    [payload],
  );
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
  const selectedSpread =
    selectedDay.competitorPrice - selectedDay.policyPrice;
  const selectedShockLabel =
    selectedDay.shock > 0
      ? formatNumber(selectedDay.shock, { digits: 2 })
      : "0.00";
  const topAnnotations = (payload.annotations ?? []).slice(0, 4);
  const recommendationTier = (
    decision.recommendationTier ?? "balanced"
  ).toUpperCase();
  const recommendationTone =
    decision.recommendationTier === "aggressive"
      ? "emerald"
      : decision.recommendationTier === "defensive"
        ? "crimson"
        : "amber";

  return (
    <div className="space-y-8">
      {/* ═══════════════════════════════════════════════════════
          COMMAND DECK — Controls + Live Telemetry
         ═══════════════════════════════════════════════════════ */}
      <Reveal>
        <section className="radar-panel p-5 sm:p-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(600px 300px at 12% 8%, rgba(201,150,43,0.06), transparent 60%), radial-gradient(600px 300px at 88% 6%, rgba(62,221,143,0.04), transparent 60%)",
            }}
          />
          <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="radar-eyebrow">Command Deck</p>
              <h3 className="radar-heading mt-3 text-[28px] sm:text-[36px]">
                Counterfactual Pricing Operations
              </h3>
              <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-slate-400 sm:text-sm">
                Stress-test pricing posture against {competitorName}{" "}
                response and demand shocks. Each control move updates
                the war-room telemetry in real time.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={recommendationTone}>
                {recommendationTier} posture
              </Chip>
              <Chip tone="neutral">Mode: {mode.toUpperCase()}</Chip>
              <Chip tone={selectedDay.shock > 0 ? "crimson" : "amber"}>
                Shock: {selectedShockLabel}
              </Chip>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER A — Market Intelligence
         ═══════════════════════════════════════════════════════ */}
      <Reveal delay={0.04}>
        <section className="radar-panel p-5 sm:p-6">
          <ChapterHeader
            number="Chapter A"
            title="Market Intelligence"
            subtitle="Compare route-day trajectory and booking-window dynamics. The policy surface reveals where algorithmic pricing captures value that static desks miss."
            badge="trajectory + pulse"
          />
          <div className="radar-chapter-line mt-5" />

          {/* Controls sidebar + main viz area */}
          <div className="mt-5 grid gap-5 2xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4 2xl:sticky 2xl:top-24 2xl:h-fit">
              <ControlBlock
                title="Policy Knobs"
                subtitle="Tune offensive posture and competitive responsiveness."
              >
                <div className="space-y-4">
                  <Slider
                    label="UAL aggressiveness"
                    value={aggressiveness}
                    min={0}
                    max={100}
                    step={1}
                    onChange={setAggressiveness}
                    formatValue={(v) => `${v}%`}
                  />
                  <Slider
                    label={`${competitorName} reactivity`}
                    value={competitorReactivity}
                    min={0}
                    max={100}
                    step={1}
                    onChange={setCompetitorReactivity}
                    formatValue={(v) => `${v}%`}
                  />
                </div>
              </ControlBlock>

              <ControlBlock
                title="Visual Layer"
                subtitle="Switch between observed baseline, policy path, and delta surfaces."
              >
                <div className="flex flex-wrap gap-2">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMode(opt.id)}
                      className="rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors"
                      style={
                        mode === opt.id
                          ? {
                            borderColor: "var(--radar-amber-50)",
                            background: "var(--radar-amber-08)",
                            color: "var(--radar-amber)",
                          }
                          : {
                            borderColor: "rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.03)",
                            color: "rgba(148,163,184,0.8)",
                          }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShockReplay((c) => !c)}
                  className="mt-4 w-full rounded-xl border px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors"
                  style={
                    shockReplay
                      ? {
                        borderColor: "var(--radar-crimson-50)",
                        background: "var(--radar-crimson-20)",
                        color: "var(--radar-crimson)",
                      }
                      : {
                        borderColor: "rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.03)",
                        color: "rgba(148,163,184,0.7)",
                      }
                  }
                >
                  {shockReplay ? "Shock replay: on" : "Shock replay: off"}
                </button>
              </ControlBlock>

              <ControlBlock
                title="Selected Day"
                subtitle="Operational readout for currently selected route-day."
              >
                <div className="space-y-2 text-[12px] text-slate-400">
                  <p className="font-mono text-[14px]" style={{ color: "var(--radar-amber)" }}>
                    {selectedDay.date} · {selectedDay.dow}
                  </p>
                  <p>
                    Policy {formatUSD(selectedDay.policyPrice, { compact: false })} vs{" "}
                    {competitorName} {formatUSD(selectedDay.competitorPrice, { compact: false })}
                  </p>
                  <p>
                    Spread:{" "}
                    <span style={{ color: selectedSpread >= 0 ? "var(--radar-green)" : "var(--radar-crimson)" }}>
                      {formatUSD(selectedSpread, { compact: false })}
                    </span>
                  </p>
                  <p>
                    Revenue Δ:{" "}
                    <span style={{ color: selectedDay.policyRegret >= 0 ? "var(--radar-green)" : "var(--radar-crimson)" }}>
                      {formatUSD(selectedDay.policyRegret)}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Shock signal: <span className="font-mono">{selectedShockLabel}</span>
                  </p>
                </div>
              </ControlBlock>
            </aside>

            <div className="space-y-5">
              {/* KPI row */}
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                <KpiCard
                  label="Counterfactual Lift"
                  value={formatUSD(summary.incrementalRevenue)}
                  hint="Policy vs observed Q2"
                  accent="emerald"
                />
                <KpiCard
                  label="Risk-Adjusted Lift"
                  value={formatUSD(decision.riskAdjustedLift ?? summary.incrementalRevenue)}
                  hint={`${competitorName} response applied`}
                  accent="amber"
                />
                <KpiCard
                  label="Peak Regret Day"
                  value={summary.peakRegretDay.date}
                  hint={formatUSD(summary.peakRegretDay.policyRegret)}
                  accent="crimson"
                />
                <KpiCard
                  label="UAL Avg Share"
                  value={formatPct(0.5 + summary.avgShareDelta, { digits: 1 })}
                  hint="Simulated average"
                  accent="amber"
                />
              </div>

              {/* Market Pulse — main D3 chart */}
              <MarketPulseHero
                rows={rows}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
              />

              {/* Decision output rail */}
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

              {/* Booking Cascade — NEW */}
              {bookingCurve.length > 0 && (
                <BookingCascade curve={bookingCurve} />
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER B — Strategy Surface
         ═══════════════════════════════════════════════════════ */}
      <Reveal delay={0.08}>
        <section className="radar-panel p-5 sm:p-6">
          <ChapterHeader
            number="Chapter B"
            title="Strategy Surface"
            subtitle="Booking-window regret lattice vs sensitivity contour — identify where the policy's edge is robust and where it degrades under parameter stress."
            badge="lattice + contour"
          />
          <div className="radar-chapter-line mt-5" />
          <div className="mt-5 grid gap-5 2xl:grid-cols-2">
            <RegretHeatLattice
              mode={mode}
              bookingWindows={heat.bookingWindows}
              dows={heat.dows}
              cells={heat.cells}
              minValue={heat.min}
              maxValue={heat.max}
              activeDow={selectedDay.dow}
            />
            {payload.sensitivitySummary ? (
              <SensitivityContour
                grid={payload.sensitivitySummary.grid}
                bestCase={payload.sensitivitySummary.bestCase}
                worstCase={payload.sensitivitySummary.worstCase}
              />
            ) : null}
          </div>

          {/* Actual vs Algo timeline */}
          <div className="mt-5">
            <ActualVsAlgoTimeline
              rows={rows}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
              bookingCurve={bookingCurve}
            />
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER C — Competitive Dynamics
         ═══════════════════════════════════════════════════════ */}
      <Reveal delay={0.12}>
        <section className="radar-panel p-5 sm:p-6">
          <ChapterHeader
            number="Chapter C"
            title="Competitive Dynamics"
            subtitle="Nash equilibrium convergence, shock stress episodes, and component-level ablation study reveal the durability and composition of the pricing advantage."
            badge="shocks + equilibrium"
          />
          <div className="radar-chapter-line mt-5" />
          <div className="mt-5 grid gap-5 2xl:grid-cols-2">
            <ShockEventStrip
              events={shocks}
              totalDays={rows.length}
              selectedIndex={selectedIndex}
              onSelectIndex={setSelectedIndex}
            />
            <NashResponseSim
              states={nash.states}
              convergenceDay={nash.convergenceDay}
            />
          </div>

          {/* Ablation waterfall — NEW */}
          {payload.ablationSummary && payload.ablationSummary.length > 0 && (
            <div className="mt-5">
              <AblationWaterfall rows={payload.ablationSummary} />
            </div>
          )}
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          DECISION MEMO
         ═══════════════════════════════════════════════════════ */}
      <Reveal delay={0.16}>
        <DecisionMemoPanel
          summary={summary}
          selectedDay={selectedDay}
          competitorName={competitorName}
          decision={decision}
          payload={payload}
        />
      </Reveal>

      {/* ── Evidence Feed ── */}
      {topAnnotations.length > 0 && (
        <Reveal delay={0.2}>
          <section className="radar-panel p-5">
            <p className="radar-eyebrow">Research Evidence Feed</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {topAnnotations.map((annotation) => (
                <article
                  key={annotation.id}
                  className="rounded-xl border border-white/[0.05] bg-black/20 px-4 py-3"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-500">
                    {annotation.timestampOrIndex}
                  </p>
                  <p
                    className="mt-1 text-[12px] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--radar-amber)" }}
                  >
                    {annotation.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-400">
                    {annotation.body}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
}
