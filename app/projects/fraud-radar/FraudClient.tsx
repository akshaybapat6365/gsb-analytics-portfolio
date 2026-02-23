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

    const weight = clamp(deceptionWeight / 100, 0, 1);
    const withAdjustedRisk = filings.map((filing) => ({
      ...filing,
      adjustedRisk: clamp(
        filing.riskScore * (1 - weight) + filing.deception * weight,
        0,
        1,
      ),
    }));

    const latest = withAdjustedRisk.at(-1);
    const maxRisk = withAdjustedRisk.reduce(
      (maxValue, filing) => Math.max(maxValue, filing.adjustedRisk),
      0,
    );

    const threshold = clamp(linkCutoff / 100, 0, 1);
    const links = payload.graph.links.filter((link) => link.weight >= threshold);
    const activeNodeIds = new Set(links.flatMap((link) => [link.source, link.target]));
    const nodes =
      links.length > 0
        ? payload.graph.nodes.filter((node) => activeNodeIds.has(node.id))
        : payload.graph.nodes;

    const start = payload.backtest.strategy[0] ?? 1;
    const leverage = 0.65 + clamp(shortIntensity / 100, 0, 1) * 0.95;
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
      .map((filing) => ({
        ticker: filing.ticker,
        date: filing.filingDate,
        score: clamp(
          filing.riskScore * (1 - weight) + filing.deception * weight,
          0,
          1,
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    const flaggedEvents = withAdjustedRisk
      .map((filing) => ({
        ...filing,
        delta: filing.adjustedRisk - filing.riskScore,
      }))
      .sort((a, b) => b.adjustedRisk - a.adjustedRisk)
      .slice(0, 8);

    const alphaCenter = payload.backtest.annualizedAlpha * (0.72 + shortIntensity / 180);
    const alphaBand: [number, number] = [
      clamp(alphaCenter - 0.08, -0.5, 1),
      clamp(alphaCenter + 0.08, -0.5, 1),
    ];
    const triggerThreshold = clamp(0.64 + shortIntensity / 250, 0.55, 0.92);

    return {
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
    };
  }, [payload, ticker, deceptionWeight, linkCutoff, shortIntensity]);

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
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-end">
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
                label="Short intensity"
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
            label="Expected Alpha Band"
            value={`${formatPct(derived.alphaBand[0], { digits: 0 })} → ${formatPct(derived.alphaBand[1], { digits: 0 })}`}
            hint="Short basket annualized range"
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
          title="Short basket recommendation board"
          description="Translate model output into expected alpha, confidence, and trigger thresholds for portfolio actioning."
          insight={`Backtest alpha center ${formatPct(derived.alphaCenter, { digits: 0 })} with trigger threshold ${formatPct(derived.triggerThreshold, { digits: 0 })}.`}
          impact={`Watchlist surfaces ${formatNumber(derived.watchlist.length)} names with highest deception-adjusted risk.`}
          annotationCount={chapterCAnnotations.length}
          tone="emerald"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EChart option={backtestChart} height={560} title="Strategy vs Benchmark (Stress-Adjusted)" className="neo-panel" />
            <DecisionConsole
              lines={[
                {
                  label: "Expected alpha band",
                  value: `${formatPct(derived.alphaBand[0], { digits: 0 })} → ${formatPct(derived.alphaBand[1], { digits: 0 })}`,
                  tone: "emerald",
                },
                {
                  label: "Trigger threshold",
                  value: formatPct(derived.triggerThreshold, { digits: 0 }),
                  tone: "amber",
                  hint: "Escalate forensic review when adjusted risk exceeds this band.",
                },
                {
                  label: "Top watchlist ticker",
                  value: derived.watchlist[0]?.ticker ?? "—",
                  tone: "crimson",
                  hint: derived.watchlist[0] ? `Score ${formatPct(derived.watchlist[0].score, { digits: 0 })}` : undefined,
                },
                {
                  label: "Short intensity setting",
                  value: `${shortIntensity}%`,
                  tone: "neutral",
                },
              ]}
            />
          </div>
          <NarrativeStrip
            title="Decision Notes"
            subtitle="Operational triggers and confidence should be reviewed alongside position sizing discipline."
            annotations={chapterCAnnotations}
            tone="emerald"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="forensic" delay={0.2}>
        <StoryChapterShell
          chapter="Evidence"
          title="Evidence and recommendation trace"
          description="Evidence rail binds recommendation IDs to confidence bands, primary drivers, and source-linked annotations."
          insight={`Current recommendation trace uses ${formatNumber(payload.decisionEvidence?.length ?? 0)} evidence blocks.`}
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
            <DecisionEvidencePanel title="Short Basket Evidence" evidence={payload.decisionEvidence} />
          </div>
        </StoryChapterShell>
      </RouteReveal>
    </div>
  );
}
