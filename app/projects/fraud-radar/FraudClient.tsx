"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/viz/EChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { Slider } from "@/components/ui/Slider";
import { StoryChapterShell } from "@/components/story/StoryChapterShell";
import { RouteReveal } from "@/components/motion/RouteReveal";
import { NarrativeStrip } from "@/components/story/NarrativeStrip";
import { DecisionEvidencePanel } from "@/components/story/DecisionEvidencePanel";
import { DecisionConsole } from "@/components/story/DecisionConsole";
import { formatNumber, formatPct } from "@/lib/metrics/format";
import type { FraudPayload } from "@/lib/schemas/fraud";
import { clamp } from "@/lib/metrics/math";
import {
  buildFraudRecommendationContract,
  type FraudRecommendationLabel,
} from "@/lib/viewmodels/fraud";

const ACCOUNTING_KEYS = [
  "revenue",
  "accrual",
  "inventory",
  "receivable",
  "margin",
  "cash",
  "expense",
  "asset",
  "liability",
  "beneish",
];

const LINGUISTIC_KEYS = [
  "sentiment",
  "tone",
  "modal",
  "hedge",
  "pronoun",
  "deception",
  "language",
  "narrative",
  "uncertainty",
  "verbosity",
];

type SignalMode = "blended" | "accounting" | "linguistic";
type InvestigationScenario = "baseline" | "balance-sheet-stress" | "language-whiplash";

function pickChapterAnnotations(
  annotations: NonNullable<FraudPayload["annotations"]>,
  keywords: string[],
) {
  const pool = annotations.filter((annotation) =>
    keywords.some((keyword) => annotation.moduleId.includes(keyword)),
  );
  return pool.length > 0 ? pool : annotations;
}

function classifySignal(signal: string) {
  const lower = signal.toLowerCase();
  if (ACCOUNTING_KEYS.some((keyword) => lower.includes(keyword))) {
    return "accounting" as const;
  }
  if (LINGUISTIC_KEYS.some((keyword) => lower.includes(keyword))) {
    return "linguistic" as const;
  }
  return "other" as const;
}

export default function FraudClient({ payload }: { payload: FraudPayload }) {
  const [ticker, setTicker] = useState<string>("");
  const [scenario, setScenario] = useState<InvestigationScenario>("baseline");
  const [deceptionWeight, setDeceptionWeight] = useState(56);
  const [linkCutoff, setLinkCutoff] = useState(28);
  const [shortIntensity, setShortIntensity] = useState(62);
  const [signalMode, setSignalMode] = useState<SignalMode>("blended");
  const [selectedFlagIndex, setSelectedFlagIndex] = useState(0);

  const derived = useMemo(() => {
    const selectedTicker =
      ticker || payload.companies[0]?.ticker || payload.filings[0]?.ticker || "";
    const filings = payload.filings
      .filter((f) => f.ticker === selectedTicker)
      .sort((a, b) => a.filingDate.localeCompare(b.filingDate));

    const scenarioTuning: Record<
      InvestigationScenario,
      {
        label: string;
        narrative: string;
        riskLift: number;
        deceptionLift: number;
        linkBias: number;
        leverageBias: number;
        reviewPosture: string;
      }
    > = {
      baseline: {
        label: "Baseline panel",
        narrative: "Balanced weighting between accounting drift and filing-language anomalies for standard surveillance.",
        riskLift: 0,
        deceptionLift: 0,
        linkBias: 0,
        leverageBias: 0,
        reviewPosture: "Monitor the issuer in the watchlist queue and wait for another corroborating filing before escalating.",
      },
      "balance-sheet-stress": {
        label: "Balance-sheet stress",
        narrative: "Overweights accrual and asset-quality concerns to surface issuers whose accounting posture is deteriorating faster than narrative signals.",
        riskLift: 0.07,
        deceptionLift: 0.03,
        linkBias: -0.08,
        leverageBias: 0.08,
        reviewPosture: "Escalate names with sustained balance-sheet deterioration into deeper forensic review, but keep language as investigative context only.",
      },
      "language-whiplash": {
        label: "Language whiplash",
        narrative: "Assumes sudden narrative instability matters most, lifting language-sensitive risk and requiring a denser similarity network before escalation.",
        riskLift: 0.03,
        deceptionLift: 0.1,
        linkBias: 0.07,
        leverageBias: -0.05,
        reviewPosture: "Treat abrupt disclosure-language swings as a prompt for transcript and filing follow-up, not as standalone proof of misconduct.",
      },
    };

    const scenarioConfig = scenarioTuning[scenario];
    const weight = clamp(deceptionWeight / 100 + scenarioConfig.deceptionLift, 0, 1);
    const withAdjustedRisk = filings.map((filing) => {
      const scenarioRisk = filing.riskScore + scenarioConfig.riskLift;
      const scenarioDeception = clamp(filing.deception + scenarioConfig.deceptionLift, 0, 1);

      return {
        ...filing,
        scenarioRisk: clamp(scenarioRisk, 0, 1),
        scenarioDeception,
        adjustedRisk: clamp(
          scenarioRisk * (1 - weight) + scenarioDeception * weight,
          0,
          1,
        ),
      };
    });

    const latest = withAdjustedRisk.at(-1);
    const maxRisk = withAdjustedRisk.reduce(
      (maxValue, filing) => Math.max(maxValue, filing.adjustedRisk),
      0,
    );

    const threshold = clamp(linkCutoff / 100 + scenarioConfig.linkBias, 0.05, 0.95);
    const links = payload.graph.links.filter((link) => link.weight >= threshold);
    const activeNodeIds = new Set(links.flatMap((link) => [link.source, link.target]));
    const nodes =
      links.length > 0
        ? payload.graph.nodes.filter((node) => activeNodeIds.has(node.id))
        : payload.graph.nodes;

    const start = payload.backtest.strategy[0] ?? 1;
    const leverage = clamp(0.65 + shortIntensity / 100 * 0.95 + scenarioConfig.leverageBias, 0.45, 1.8);
    const adjustedStrategy = payload.backtest.strategy.map((value) => {
      const delta = value - start;
      return start + delta * leverage;
    });

    const signalCounts = withAdjustedRisk
      .flatMap((filing) => filing.topSignals)
      .reduce<Record<string, number>>((acc, signal) => {
        acc[signal] = (acc[signal] ?? 0) + 1;
        return acc;
      }, {});

    const topSignals = Object.entries(signalCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([signal, count]) => ({ signal, count, family: classifySignal(signal) }));

    const latestByTicker = payload.filings.reduce<Record<string, (typeof payload.filings)[number]>>(
      (acc, filing) => {
        const existing = acc[filing.ticker];
        if (!existing || filing.filingDate > existing.filingDate) {
          acc[filing.ticker] = filing;
        }
        return acc;
      },
      {},
    );

    const watchlist = Object.values(latestByTicker)
      .map((filing) => {
        const scenarioRisk = filing.riskScore + scenarioConfig.riskLift;
        const scenarioDeception = clamp(filing.deception + scenarioConfig.deceptionLift, 0, 1);
        const score = clamp(scenarioRisk * (1 - weight) + scenarioDeception * weight, 0, 1);
        const action = score >= 0.84 ? "Escalate review" : score >= 0.68 ? "Keep on watchlist" : "Observe only";

        return {
          ticker: filing.ticker,
          date: filing.filingDate,
          score,
          action,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const flaggedEvents = withAdjustedRisk
      .map((filing) => ({
        ...filing,
        delta: filing.adjustedRisk - filing.riskScore,
      }))
      .sort((a, b) => b.adjustedRisk - a.adjustedRisk)
      .slice(0, 8);

    const alphaCenter = clamp(
      payload.backtest.annualizedAlpha * (0.72 + shortIntensity / 180 + scenarioConfig.leverageBias),
      -0.5,
      1,
    );
    const alphaBand: [number, number] = [
      clamp(alphaCenter - 0.08, -0.5, 1),
      clamp(alphaCenter + 0.08, -0.5, 1),
    ];
    const triggerThreshold = clamp(0.64 + shortIntensity / 250 + scenarioConfig.riskLift / 2, 0.55, 0.92);
    const watchlistEntry = watchlist[0] ?? null;
    const recommendation: FraudRecommendationLabel =
      !latest || latest.adjustedRisk < 0.62
        ? "Observe only"
        : latest.adjustedRisk >= triggerThreshold + 0.08
          ? "Escalate forensic review"
          : "Keep on watchlist";
    const recommendationReason =
      recommendation === "Escalate forensic review"
        ? `Adjusted risk is ${formatPct(latest?.adjustedRisk ?? 0, { digits: 0 })}, which sits above the current escalation band and warrants a deeper filing, transcript, and exposure review.`
        : recommendation === "Keep on watchlist"
          ? `Current signals are elevated but still suited to triage monitoring while investigators wait for another corroborating event or disclosure.`
          : `Current evidence does not support an immediate escalation; preserve monitoring and avoid over-reading modeled anomalies as verdicts.`;

    const recommendationContract = buildFraudRecommendationContract({
      payload,
      recommendation,
      scenarioLabel: scenarioConfig.label,
      reviewPosture: scenarioConfig.reviewPosture,
      selectedTicker,
      latestAdjustedRisk: latest?.adjustedRisk ?? null,
      triggerThreshold,
      topWatchlistTicker: watchlistEntry?.ticker ?? null,
      topWatchlistScore: watchlistEntry?.score ?? null,
      retainedLinkCount: links.length,
      linkCutoffPct: Math.round(threshold * 100),
      alphaBand,
    });

    return {
      scenarioConfig,
      selectedTicker,
      withAdjustedRisk,
      latest,
      maxRisk,
      nodes,
      links,
      threshold,
      adjustedStrategy,
      topSignals,
      watchlist,
      flaggedEvents,
      alphaBand,
      triggerThreshold,
      alphaCenter,
      recommendation,
      recommendationReason,
      recommendationContract,
    };
  }, [payload, ticker, scenario, deceptionWeight, linkCutoff, shortIntensity]);

  const selectedFlag =
    derived.flaggedEvents[selectedFlagIndex] ?? derived.flaggedEvents[0] ?? null;

  const viewedSignals = useMemo(() => {
    if (signalMode === "blended") {
      return derived.topSignals.slice(0, 8);
    }
    return derived.topSignals
      .filter((entry) => entry.family === signalMode)
      .slice(0, 8);
  }, [derived.topSignals, signalMode]);

  const riskChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 54, top: 20, bottom: 42 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: derived.withAdjustedRisk.map((filing) => filing.filingDate),
      axisLabel: { color: "#94a3b8", hideOverlap: true },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: [
      {
        type: "value",
        min: 0,
        max: 1,
        axisLabel: {
          color: "#94a3b8",
          formatter: (value: number) => `${Math.round(value * 100)}%`,
        },
        splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      },
      {
        type: "value",
        min: 0,
        max: 1,
        axisLabel: {
          color: "#94a3b8",
          formatter: (value: number) => `${Math.round(value * 100)}%`,
        },
      },
    ],
    series: [
      {
        name: "Raw risk score",
        type: "line",
        data: derived.withAdjustedRisk.map((filing) => filing.riskScore),
        smooth: 0.24,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(157,49,49,0.68)" },
      },
      {
        name: "Adjusted risk score",
        type: "line",
        data: derived.withAdjustedRisk.map((filing) => filing.adjustedRisk),
        smooth: 0.24,
        symbol: "none",
        lineStyle: { width: 3, color: "rgba(244,63,94,0.98)" },
        areaStyle: { color: "rgba(244,63,94,0.12)" },
        markPoint: {
          symbol: "pin",
          symbolSize: 44,
          data: derived.flaggedEvents.slice(0, 3).map((filing) => ({
            coord: [filing.filingDate, filing.adjustedRisk],
            name: filing.filingDate,
            value: `${Math.round(filing.adjustedRisk * 100)}%`,
          })),
          itemStyle: { color: "rgba(190,24,93,0.9)" },
          label: { color: "#fff", fontSize: 9 },
        },
      },
      {
        name: "Deception index",
        type: "line",
        yAxisIndex: 1,
        data: derived.withAdjustedRisk.map((filing) => filing.deception),
        smooth: 0.24,
        symbol: "none",
        lineStyle: { width: 2.2, color: "rgba(139,107,62,0.9)", type: "dashed" },
      },
    ],
  };

  const graphChart: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {},
    series: [
      {
        type: "graph",
        layout: "force",
        roam: true,
        data: derived.nodes.map((node) => {
          const focused = node.id.toUpperCase().includes(derived.selectedTicker.toUpperCase());
          return {
            id: node.id,
            name: node.id,
            value: node.group,
            symbolSize: focused ? 32 : 14 + node.group * 4,
            itemStyle: {
              color: focused
                ? "rgba(244,63,94,0.96)"
                : node.group >= 3
                  ? "rgba(157,49,49,0.9)"
                  : node.group === 2
                    ? "rgba(139,107,62,0.88)"
                    : "rgba(182,169,151,0.82)",
            },
          };
        }),
        links: derived.links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.weight,
          lineStyle: {
            width: 0.8 + link.weight * 2.6,
            opacity: 0.4,
            color: "rgba(226,232,240,0.48)",
          },
        })),
        force: { repulsion: 190, edgeLength: 76, gravity: 0.05 },
        label: { show: true, color: "#e2e8f0", fontSize: 10 },
      },
    ],
  };

  const signalChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 92, right: 24, top: 26, bottom: 30 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.1)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "category",
      data: viewedSignals.map((entry) => entry.signal),
      axisLabel: { color: "#cbd5e1", width: 140, overflow: "truncate" },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    series: [
      {
        type: "bar",
        data: viewedSignals.map((entry) => entry.count),
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { dataIndex?: unknown };
            const idx = typeof raw.dataIndex === "number" ? raw.dataIndex : 0;
            const item = viewedSignals[idx];
            if (!item) return "rgba(157,49,49,0.84)";
            if (item.family === "accounting") return "rgba(139,107,62,0.84)";
            if (item.family === "linguistic") return "rgba(157,49,49,0.84)";
            return "rgba(73,95,69,0.82)";
          },
        },
      },
    ],
  };

  const backtestChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 50, right: 30, top: 20, bottom: 42 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: payload.backtest.dates,
      axisLabel: { color: "#94a3b8", hideOverlap: true },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
    },
    series: [
      {
        name: "Strategy (adjusted)",
        type: "line",
        data: derived.adjustedStrategy,
        smooth: 0.2,
        symbol: "none",
        lineStyle: { width: 2.6, color: "rgba(73,95,69,0.95)" },
        areaStyle: { color: "rgba(73,95,69,0.1)" },
      },
      {
        name: "Benchmark",
        type: "line",
        data: payload.backtest.benchmark,
        smooth: 0.2,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(182,169,151,0.85)" },
      },
    ],
  };

  const annotations = payload.annotations ?? [];
  const chapterAAnnotations = pickChapterAnnotations(annotations, ["risk", "timeline", "forensic"]);
  const chapterBAnnotations = pickChapterAnnotations(annotations, ["cluster", "network", "similarity", "signal"]);
  const chapterCAnnotations = pickChapterAnnotations(annotations, ["recommendation", "short", "alpha"]);
  const chapterDAnnotations = pickChapterAnnotations(annotations, ["recommendation", "evidence"]);

  return (
    <div className="space-y-8">
      <RouteReveal profile="forensic">
        <section className="neo-panel p-5">
          <div className="grid gap-4 xl:grid-cols-[280px_320px_minmax(0,1fr)] xl:items-end">
            <div className="space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-100/85">Forensic Controls</p>
              <label className="flex flex-col gap-2 text-xs text-slate-400">
                Company
                <select
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
                  value={derived.selectedTicker}
                  onChange={(event) => {
                    setTicker(event.target.value);
                    setSelectedFlagIndex(0);
                  }}
                >
                  {payload.companies.map((company) => (
                    <option key={company.ticker} value={company.ticker}>
                      {company.ticker} · {company.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex flex-col gap-2 text-xs text-slate-400">
                Scenario
                <select
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
                  value={scenario}
                  onChange={(event) => {
                    setScenario(event.target.value as InvestigationScenario);
                    setSelectedFlagIndex(0);
                  }}
                >
                  <option value="baseline">Baseline panel</option>
                  <option value="balance-sheet-stress">Balance-sheet stress</option>
                  <option value="language-whiplash">Language whiplash</option>
                </select>
              </label>
              <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm leading-relaxed text-slate-300">
                {derived.scenarioConfig.narrative}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Slider
                label="Deception weight"
                value={deceptionWeight}
                min={0}
                max={100}
                step={1}
                onChange={setDeceptionWeight}
                formatValue={(value) => `${value}%`}
              />
              <Slider
                label="Cluster link cutoff"
                value={linkCutoff}
                min={0}
                max={90}
                step={1}
                onChange={setLinkCutoff}
                formatValue={(value) => `${value}%`}
              />
              <Slider
                label="Review intensity"
                value={shortIntensity}
                min={0}
                max={100}
                step={1}
                onChange={setShortIntensity}
                formatValue={(value) => `${value}%`}
              />
            </div>
          </div>
        </section>
      </RouteReveal>

      <RouteReveal profile="forensic" delay={0.04}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Adjusted Risk (Latest)"
            value={derived.latest ? formatPct(derived.latest.adjustedRisk, { digits: 0 }) : "—"}
            hint={`${derived.selectedTicker} latest filing`}
            accent="crimson"
          />
          <KpiCard
            label="Peak Risk (History)"
            value={formatPct(derived.maxRisk, { digits: 0 })}
            hint="Max adjusted filing score"
            accent="amber"
          />
          <KpiCard
            label="Filtered Cluster Links"
            value={formatNumber(derived.links.length)}
            hint={`Cutoff ≥ ${Math.round(derived.threshold * 100)}%`}
            accent="cyan"
          />
          <KpiCard
            label="Recommendation Posture"
            value={derived.recommendation}
            hint={derived.scenarioConfig.label}
            accent="emerald"
          />
        </div>
      </RouteReveal>

      <RouteReveal profile="forensic" delay={0.08}>
        <StoryChapterShell
          chapter="Primary Analysis"
          title="Forensic timeline and event board"
          description="Dual-axis risk/deception trajectory with filing-level flag events and direct why-flagged context."
          insight={`Latest adjusted risk ${derived.latest ? formatPct(derived.latest.adjustedRisk, { digits: 0 }) : "—"} for ${derived.selectedTicker}.`}
          impact={`${formatNumber(derived.withAdjustedRisk.length)} filings sequenced with top-${formatNumber(derived.flaggedEvents.length)} anomaly flags.`}
          annotationCount={chapterAAnnotations.length}
          tone="crimson"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EChart option={riskChart} height={620} title="Forensic Timeline (Risk vs Deception)" className="neo-panel" />
            <section className="terminal overflow-hidden" data-testid="decision-console">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">Flagged Filing Drawer</p>
              </div>
              <div className="space-y-2 px-5 py-4">
                {derived.flaggedEvents.map((filing, index) => (
                  <button
                    key={`${filing.filingDate}-${filing.ticker}`}
                    type="button"
                    onClick={() => setSelectedFlagIndex(index)}
                    className={
                      selectedFlagIndex === index
                        ? "w-full rounded-xl border border-rose-300/30 bg-rose-300/12 px-3 py-2 text-left"
                        : "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left hover:bg-white/[0.08]"
                    }
                  >
                    <p className="text-xs text-slate-200">{filing.filingDate}</p>
                    <p className="text-sm font-semibold text-slate-100">
                      {filing.ticker} · {formatPct(filing.adjustedRisk, { digits: 0 })}
                    </p>
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 px-5 py-4 text-sm text-slate-300">
                <p>
                  <span className="text-slate-100">Selected filing:</span> {selectedFlag?.filingDate ?? "—"}
                </p>
                <p>
                  <span className="text-slate-100">Top signals:</span> {selectedFlag?.topSignals.slice(0, 3).join(" · ") || "—"}
                </p>
                <p>
                  <span className="text-slate-100">Risk uplift:</span>{" "}
                  {selectedFlag ? formatPct(selectedFlag.delta, { digits: 1 }) : "—"}
                </p>
                <p className="mt-3 rounded-xl border border-rose-300/15 bg-rose-300/8 px-3 py-2 text-xs leading-relaxed text-rose-100/90">
                  Triage note: this drawer prioritizes what to investigate next. It is not a verdict, accusation, or legal finding.
                </p>
              </div>
            </section>
          </div>
          <NarrativeStrip
            title="Forensic Annotations"
            subtitle="Event-linked callouts for filing chronology and risk regime transitions."
            annotations={chapterAAnnotations}
            tone="rose"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="forensic" delay={0.12}>
        <StoryChapterShell
          chapter="Stress / Scenario"
          title="Similarity network and attribution matrix"
          description="Threshold scrubber and signal-family split expose structural fraud resemblance under different evidence priors."
          insight={`${formatNumber(derived.links.length)} graph links retained at ${Math.round(derived.threshold * 100)}% cutoff.`}
          impact="Cluster structure and marker family shifts indicate how fragile conviction is under alternate assumptions."
          annotationCount={chapterBAnnotations.length}
          tone="amber"
        >
          <EChart option={graphChart} height={620} title="Fraud Similarity Network (Thresholded)" className="neo-panel" />
          <section className="glass rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Signal Attribution Matrix</p>
              <div className="flex flex-wrap gap-2">
                {(["blended", "accounting", "linguistic"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSignalMode(mode)}
                    className={
                      signalMode === mode
                        ? "rounded-full border border-amber-300/35 bg-amber-300/14 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-100"
                        : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.08]"
                    }
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <EChart option={signalChart} height={520} title="Signal Family Contribution" className="bg-transparent" />
            </div>
          </section>
          <NarrativeStrip
            title="Scenario Notes"
            subtitle="Signal-family toggles demonstrate where accounting and linguistic evidence diverge or reinforce."
            annotations={chapterBAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="forensic" delay={0.16}>
        <StoryChapterShell
          chapter="Decision Console"
          title="Recommendation console: triage, not verdict"
          description="Turn the signal stack into an actionable review queue while keeping every recommendation explicitly inside investigate / watchlist / observe language."
          insight={`Backtest alpha center ${formatPct(derived.alphaCenter, { digits: 0 })} with trigger threshold ${formatPct(derived.triggerThreshold, { digits: 0 })}.`}
          impact={`Watchlist surfaces ${formatNumber(derived.watchlist.length)} names with highest deception-adjusted risk.`}
          annotationCount={chapterCAnnotations.length}
          tone="emerald"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EChart option={backtestChart} height={560} title="Strategy vs Benchmark (Stress-Adjusted)" className="neo-panel" />
            <DecisionConsole
              title="Triage Recommendation Console"
              lines={[
                {
                  label: "Recommended posture",
                  value: derived.recommendation,
                  tone: "emerald",
                  hint: derived.recommendationReason,
                },
                {
                  label: "Expected alpha band",
                  value: `${formatPct(derived.alphaBand[0], { digits: 0 })} → ${formatPct(derived.alphaBand[1], { digits: 0 })}`,
                  tone: "emerald",
                  hint: "Backtest output remains modeled portfolio evidence, not a realized enforcement outcome.",
                },
                {
                  label: "Trigger threshold",
                  value: formatPct(derived.triggerThreshold, { digits: 0 }),
                  tone: "amber",
                  hint: "Crossing this band should escalate forensic review, not trigger an accusation or legal conclusion.",
                },
                {
                  label: "Top watchlist ticker",
                  value: derived.watchlist[0]?.ticker ?? "—",
                  tone: "crimson",
                  hint: derived.watchlist[0]
                    ? `${derived.watchlist[0].action} at ${formatPct(derived.watchlist[0].score, { digits: 0 })} adjusted risk.`
                    : undefined,
                },
                {
                  label: "Review intensity setting",
                  value: `${shortIntensity}%`,
                  tone: "neutral",
                  hint: "Higher intensity widens the modeled payoff range but should still be paired with human review discipline.",
                },
              ]}
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <NarrativeStrip
              title="Decision Notes"
              subtitle="Operational triggers and confidence should be reviewed alongside position sizing discipline."
              annotations={chapterCAnnotations}
              tone="emerald"
              maxItems={4}
            />
            <section className="glass rounded-2xl p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/85">Why this recommendation remains bounded</p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                {derived.recommendationContract.boundedNotes.map((note) => (
                  <p key={note} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3">
                    {note}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="forensic" delay={0.2}>
        <StoryChapterShell
          chapter="Evidence"
          title="Evidence and recommendation trace"
          description="Evidence rail binds recommendation IDs to confidence bands, primary drivers, and source-linked annotations."
          insight={`Current recommendation trace uses ${formatNumber(derived.recommendationContract.evidence.length)} evidence block${derived.recommendationContract.evidence.length === 1 ? "" : "s"} for the active posture.`}
          impact="Provides auditable handoff from forensic signal stack to portfolio action recommendation."
          annotationCount={chapterDAnnotations.length}
          tone="crimson"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <NarrativeStrip
              title="Evidence Callouts"
              subtitle="Source-linked annotation clusters supporting the active recommendation regime."
              annotations={chapterDAnnotations}
              tone="rose"
              maxItems={6}
            />
            <DecisionEvidencePanel
              title={derived.recommendationContract.evidenceTitle}
              summary={derived.recommendationContract.evidenceSummary}
              footer={derived.recommendationContract.evidenceFooter}
              evidence={derived.recommendationContract.evidence}
            />
          </div>
        </StoryChapterShell>
      </RouteReveal>
    </div>
  );
}
