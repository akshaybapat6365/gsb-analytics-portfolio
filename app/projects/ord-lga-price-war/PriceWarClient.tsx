"use client";

import { useMemo } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { DecisionConsole } from "@/components/story/DecisionConsole";
import { Chip } from "@/components/ui/Chip";
import { KpiCard } from "@/components/ui/KpiCard";
import { Slider } from "@/components/ui/Slider";
import { ActualVsAlgoTimeline } from "@/components/viz/ord-lga/ActualVsAlgoTimeline";
import { DecisionMatrixTerminal } from "@/components/viz/ord-lga/DecisionMatrixTerminal";
import { MarketPulseHero } from "@/components/viz/ord-lga/MarketPulseHero";
import { NashResponseSim } from "@/components/viz/ord-lga/NashResponseSim";
import { RegretHeatLattice } from "@/components/viz/ord-lga/RegretHeatLattice";
import { ShockEventStrip } from "@/components/viz/ord-lga/ShockEventStrip";
import { SensitivityContour } from "@/components/viz/ord-lga/SensitivityContour";
import { AblationWaterfall } from "@/components/viz/ord-lga/AblationWaterfall";
import { BookingCascade } from "@/components/viz/ord-lga/BookingCascade";
// New Phase 3 components
import RevenuePnLWaterfall from "@/components/viz/ord-lga/RevenuePnLWaterfall";
import { CanvasPointScatter } from "@/components/viz/ord-lga/CanvasPointScatter";
import { GLSLHeatmap } from "@/components/viz/ord-lga/GLSLHeatmap";
import { GLSLSensitivity } from "@/components/viz/ord-lga/GLSLSensitivity";
import CompetitorResponseLag from "@/components/viz/ord-lga/CompetitorResponseLag";
import ValidationBenchmark from "@/components/viz/ord-lga/ValidationBenchmark";
import NarrativeTimeline from "@/components/viz/ord-lga/NarrativeTimeline";
import MarketShareAlluvial from "@/components/viz/ord-lga/MarketShareAlluvial";
import { PrologueCanvas3D } from "@/components/viz/ord-lga/PrologueCanvas3D";
import { HeroMetricsUI } from "@/components/viz/ord-lga/HeroMetricsUI";
import { AnimatedNeonCounter } from "@/components/viz/ord-lga/AnimatedNeonCounter";
import { AlluvialFlow3D } from "@/components/viz/ord-lga/AlluvialFlow3D";
import { NashSpiral } from "@/components/viz/ord-lga/NashSpiral";
import { RegretRibbonAdvanced } from "@/components/viz/ord-lga/RegretRibbonAdvanced";
import { ValidationRadar } from "@/components/viz/ord-lga/ValidationRadar";
import { VolumeProfile } from "@/components/viz/ord-lga/VolumeProfile";
import { CompetitorDelayMatrix } from "@/components/viz/ord-lga/CompetitorDelayMatrix";
import { ShockConstellation } from "@/components/viz/ord-lga/ShockConstellation";
import { FloatingActionMenu } from "@/components/viz/ord-lga/FloatingActionMenu";

import {
  type PolicyViewMode,
  buildDailyPnL,
  buildFareDistribution,
  buildCumulativeRegret,
  buildCompetitorLagSeries,
  buildValidationComparison,
  buildNarrativeTimeline,
  buildWeeklyRollup,
} from "@/components/viz/ord-lga/transforms";
import { useOrdLgaScrollytelling } from "@/components/viz/ord-lga/useOrdLgaScrollytelling";
import { runAirlineDecisionEngine } from "@/lib/decision-engines/airline";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { AirlinePayload } from "@/lib/schemas/airline";

const MODE_OPTIONS: Array<{ id: PolicyViewMode; label: string }> = [
  { id: "observed", label: "Observed" },
  { id: "counterfactual", label: "Policy" },
  { id: "delta", label: "Delta" },
];

/* ─── Chapter Header — FLAT, no card ─── */
function ChapterHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-mono)", color: "rgba(0, 240, 255, 0.45)" }}
      >
        {number}
      </p>
      <h3
        className="mt-3 text-[28px] sm:text-[36px] lg:text-[42px] font-bold text-white"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.035em", lineHeight: "1.08" }}
      >
        {title}
      </h3>
      <p
        className="mt-3 max-w-2xl text-[15px] leading-[1.7]"
        style={{ fontFamily: "var(--font-body)", color: "rgba(226, 232, 240, 0.5)" }}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* ─── Chapter Divider — clean line ─── */
function ChapterDivider() {
  return (
    <div className="my-16">
      <div
        className="h-px w-full"
        style={{ background: "linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.12) 30%, rgba(0, 240, 255, 0.12) 70%, transparent 100%)" }}
      />
    </div>
  );
}

/* ─── Control Block — NO card wrapper, just content ─── */
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
    <div className="py-3">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.15em]"
        style={{ fontFamily: "var(--font-mono)", color: "rgba(0, 240, 255, 0.4)" }}
      >
        {title}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(226, 232, 240, 0.4)" }}>
        {subtitle}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/* ═══════ Main Component — 6-Chapter Narrative ═══════ */
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
  const selectedSpread = selectedDay.competitorPrice - selectedDay.policyPrice;
  const selectedShockLabel = selectedDay.shock > 0 ? formatNumber(selectedDay.shock, { digits: 2 }) : "0.00";
  const topAnnotations = (payload.annotations ?? []).slice(0, 4);
  const recommendationTier = (decision.recommendationTier ?? "balanced").toUpperCase();
  const recommendationTone =
    decision.recommendationTier === "aggressive" ? "emerald"
      : decision.recommendationTier === "defensive" ? "crimson" : "amber";

  // Derived data for new components
  const pnlData = useMemo(() => buildDailyPnL(rows), [rows]);
  const fareDistData = useMemo(() => buildFareDistribution(rows), [rows]);
  const cumRegretData = useMemo(() => buildCumulativeRegret(rows, payload.uncertainty), [rows, payload.uncertainty]);
  const lagData = useMemo(() => buildCompetitorLagSeries(rows), [rows]);
  const validationData = useMemo(() => buildValidationComparison(payload), [payload]);
  const narrativeNodes = useMemo(() => buildNarrativeTimeline(payload, rows), [payload, rows]);
  const weeklyBins = useMemo(() => buildWeeklyRollup(rows), [rows]);

  return (
    <div className="space-y-4 relative">
      <FloatingActionMenu />

      {/* ═══════════════════════════════════════════════════════
          PHASE 2 PROLOGUE — 3D Interactive Terminal
         ═══════════════════════════════════════════════════════ */}
      <section id="prologue" className="relative w-full min-h-screen flex flex-col justify-center overflow-hidden">
        {/* React Three Fiber Canvas Layer */}
        <PrologueCanvas3D />

        {/* Glassmorphic HTML Metrics Layer */}
        <HeroMetricsUI />
      </section>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 1 — Market Intelligence
         ═══════════════════════════════════════════════════════ */}
      <ChapterDivider />
      <Reveal delay={0.04}>
        <section id="ch-market" className="px-4 sm:px-6">
          <ChapterHeader
            number="Chapter 1"
            title="Market Intelligence"
            subtitle="Compare route-day trajectory and booking-window dynamics. The policy surface reveals where algorithmic pricing captures value that static desks miss."
            badge="trajectory + pulse"
          />
          <div className="radar-chapter-line mt-5" />

          <div className="mt-8 space-y-8">
            <aside className="space-y-2">
              <ControlBlock
                title="Policy Knobs"
                subtitle="Tune offensive posture and competitive responsiveness."
              >
                <div className="space-y-4">
                  <Slider label="UAL aggressiveness" value={aggressiveness} min={0} max={100} step={1} onChange={setAggressiveness} formatValue={(v) => `${v}%`} />
                  <Slider label={`${competitorName} reactivity`} value={competitorReactivity} min={0} max={100} step={1} onChange={setCompetitorReactivity} formatValue={(v) => `${v}%`} />
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
                          ? { borderColor: "var(--radar-amber-50)", background: "var(--radar-amber-08)", color: "var(--radar-amber)" }
                          : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(148,163,184,0.8)" }
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
                      ? { borderColor: "var(--radar-crimson-50)", background: "var(--radar-crimson-20)", color: "var(--radar-crimson)" }
                      : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(148,163,184,0.7)" }
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
                      <AnimatedNeonCounter glow="cyan" value={selectedDay.policyRegret} format="usd" duration={400} />
                    </span>
                  </p>
                </div>
              </ControlBlock>
            </aside>

            <div className="space-y-8">
              {/* KPI row with AnimatedNumber */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <div className="radar-kpi radar-glow-green p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-green)" }}>Counterfactual Lift</p>
                  <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-green)" }}>
                    <AnimatedNeonCounter glow="cyan" value={summary.incrementalRevenue} format="usd" showDelta />
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-500">Policy vs observed Q2</p>
                </div>
                <div className="radar-kpi radar-glow-amber p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-amber)" }}>Risk-Adjusted Lift</p>
                  <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-amber)" }}>
                    <AnimatedNeonCounter glow="cyan" value={decision.riskAdjustedLift ?? summary.incrementalRevenue} format="usd" showDelta />
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-500">{competitorName} response applied</p>
                </div>
                <div className="radar-kpi p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-crimson)" }}>Peak Regret Day</p>
                  <p className="mt-1 font-mono text-lg text-slate-100">{summary.peakRegretDay.date}</p>
                  <p className="mt-0.5 font-mono text-[9px]" style={{ color: "var(--radar-crimson)" }}>{formatUSD(summary.peakRegretDay.policyRegret)}</p>
                </div>
                <div className="radar-kpi radar-glow-amber p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-amber)" }}>UAL Avg Share</p>
                  <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-amber)" }}>
                    <AnimatedNeonCounter glow="cyan" value={(0.5 + summary.avgShareDelta) * 100} format="number" suffix="%" showDelta />
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-500">Simulated average</p>
                </div>
              </div>

              {/* Market Pulse — main D3 chart */}
              <MarketPulseHero
                rows={rows}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
              />

              {/* Booking Cascade */}
              {bookingCurve.length > 0 && (
                <BookingCascade curve={bookingCurve} />
              )}

              {/* Narrative Timeline */}
              {narrativeNodes.length > 0 && (
                <NarrativeTimeline
                  nodes={narrativeNodes}
                  selectedIndex={selectedIndex}
                  onSelectIndex={setSelectedIndex}
                />
              )}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 2 — Price Discovery
         ═══════════════════════════════════════════════════════ */}
      <ChapterDivider />
      <Reveal delay={0.06}>
        <section id="ch-pricing" className="px-4 sm:px-6">
          <ChapterHeader
            number="Chapter 2"
            title="Price Discovery"
            subtitle="Fare distributions reveal where the algorithm shifts the pricing surface. Revenue decomposition shows exactly where the $567K comes from."
            badge="distributions + P&L"
          />
          <div className="radar-chapter-line mt-5" />
          <div className="mt-8 space-y-8">
            <CanvasPointScatter />
            <RevenuePnLWaterfall data={pnlData} />
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 3 — Strategy Surface
         ═══════════════════════════════════════════════════════ */}
      <ChapterDivider />
      <Reveal delay={0.08}>
        <section id="ch-strategy" className="px-4 sm:px-6">
          <ChapterHeader
            number="Chapter 3"
            title="Strategy Surface"
            subtitle="Booking-window regret lattice vs sensitivity contour. Identify where the policy's edge is robust and where it degrades under parameter stress."
            badge="lattice + contour + regret"
          />
          <div className="radar-chapter-line mt-5" />
          <div className="mt-8 space-y-8">
            <GLSLHeatmap />
            <GLSLSensitivity />
          </div>
          {/* Cumulative Regret Ribbon */}
          <div className="mt-5">
            <RegretRibbonAdvanced data={cumRegretData} />
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 4 — Competitive Dynamics
         ═══════════════════════════════════════════════════════ */}
      <ChapterDivider />
      <Reveal delay={0.10}>
        <section id="ch-competitive" className="px-4 sm:px-6">
          <ChapterHeader
            number="Chapter 4"
            title="Competitive Dynamics"
            subtitle="Nash equilibrium convergence, shock stress episodes, competitor response lag, and market share flow reveal the durability and composition of the pricing advantage."
            badge="shocks + equilibrium + lag"
          />
          <div className="radar-chapter-line mt-5" />
          <div className="mt-8 space-y-8">
            <div className="flex flex-col gap-5">
              <ShockEventStrip
                events={shocks}
                totalDays={rows.length}
                selectedIndex={selectedIndex}
                onSelectIndex={setSelectedIndex}
              />
              <ShockConstellation events={shocks} />
            </div>
            <NashSpiral
              states={nash.states}
              convergenceDay={nash.convergenceDay}
            />
          </div>
          <div className="mt-8 space-y-8">
            <CompetitorResponseLag data={lagData} />
            <CompetitorDelayMatrix data={lagData} />
            <AlluvialFlow3D data={weeklyBins} />
            <VolumeProfile data={rows} />
          </div>
        </section>
      </Reveal>

      {/* ═══════════════════════════════════════════════════════
          CHAPTER 5 — Model Validation
         ═══════════════════════════════════════════════════════ */}
      <ChapterDivider />
      <Reveal delay={0.12}>
        <section id="ch-validation" className="px-4 sm:px-6">
          <ChapterHeader
            number="Chapter 5"
            title="Model Validation"
            subtitle="Validation benchmarks, component-level ablation study, and actual vs. algorithmic timelines establish the model's credibility and decompose its edge."
            badge="benchmark + ablation"
          />
          <div className="radar-chapter-line mt-5" />

          {/* Validation Benchmark */}
          {validationData && (
            <div className="mt-5">
              <ValidationRadar data={undefined /* Uses built-in mock metrics for now */} />
            </div>
          )}

          {/* Ablation waterfall */}
          {payload.ablationSummary && payload.ablationSummary.length > 0 && (
            <div className="mt-5">
              <AblationWaterfall rows={payload.ablationSummary} />
            </div>
          )}

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
          EPILOGUE — Decision Memo + Evidence Feed
         ═══════════════════════════════════════════════════════ */}
      <ChapterDivider />
      <Reveal delay={0.14}>
        <section id="epilogue">
          <DecisionMatrixTerminal decision={decision} />
        </section>
      </Reveal>

      {/* Evidence Feed */}
      {topAnnotations.length > 0 && (
        <Reveal delay={0.16}>
          <section className="px-4 sm:px-6">
            <p className="radar-eyebrow">Research Evidence Feed</p>
            <div className="mt-4 space-y-3">
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

      {/* Decision Output Rail */}
      <Reveal delay={0.18}>
        <DecisionConsole
          title="Decision Output Rail"
          lines={[
            { label: "Quarterly counterfactual lift", value: formatUSD(summary.incrementalRevenue), tone: "emerald" },
            { label: "Risk-adjusted expected lift", value: formatUSD(decision.riskAdjustedLift ?? summary.incrementalRevenue), tone: "amber" },
            { label: "Selected-day tactical delta", value: formatUSD(selectedDay.policyRegret), tone: selectedDay.policyRegret >= 0 ? "emerald" : "crimson" },
            { label: "Implied share edge (UAL vs DL)", value: formatPct(selectedDay.uaShare - selectedDay.dlShare, { digits: 1 }), tone: selectedDay.uaShare >= selectedDay.dlShare ? "amber" : "crimson" },
          ]}
        />
      </Reveal>
    </div>
  );
}
