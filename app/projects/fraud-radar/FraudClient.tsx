"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/viz/EChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { Slider } from "@/components/ui/Slider";
import { StoryChapterShell } from "@/components/story/StoryChapterShell";
import { formatNumber, formatPct } from "@/lib/metrics/format";
import type { FraudPayload } from "@/lib/schemas/fraud";
import { clamp } from "@/lib/metrics/math";

export default function FraudClient({ payload }: { payload: FraudPayload }) {
  const [ticker, setTicker] = useState<string>("");
  const [deceptionWeight, setDeceptionWeight] = useState(56);
  const [linkCutoff, setLinkCutoff] = useState(28);
  const [shortIntensity, setShortIntensity] = useState(62);

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
      .slice(0, 8)
      .map(([signal, count]) => ({ signal, count }));

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
      .slice(0, 6);

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
    };
  }, [payload, ticker, deceptionWeight, linkCutoff, shortIntensity]);

  const riskChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 44, right: 24, top: 20, bottom: 36 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: derived.withAdjustedRisk.map((filing) => filing.filingDate),
      axisLabel: { color: "#94a3b8", hideOverlap: true },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 1,
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: number) => `${Math.round(value * 100)}%`,
      },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
    },
    series: [
      {
        name: "Raw risk score",
        type: "line",
        data: derived.withAdjustedRisk.map((filing) => filing.riskScore),
        smooth: 0.24,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(251,113,133,0.82)" },
      },
      {
        name: "Adjusted risk score",
        type: "line",
        data: derived.withAdjustedRisk.map((filing) => filing.adjustedRisk),
        smooth: 0.24,
        symbol: "none",
        lineStyle: { width: 2.8, color: "rgba(244,63,94,0.98)" },
        areaStyle: { color: "rgba(244,63,94,0.12)" },
      },
      {
        name: "Deception intensity",
        type: "line",
        data: derived.withAdjustedRisk.map((filing) => filing.deception),
        smooth: 0.24,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(34,211,238,0.92)" },
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
        data: derived.nodes.map((node) => ({
          id: node.id,
          name: node.id,
          value: node.group,
          symbolSize: 14 + node.group * 3.4,
          itemStyle: {
            color:
              node.group >= 3
                ? "rgba(251,113,133,0.9)"
                : node.group === 2
                  ? "rgba(251,191,36,0.88)"
                  : "rgba(148,163,184,0.82)",
          },
        })),
        links: derived.links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.weight,
          lineStyle: {
            width: 0.7 + link.weight * 2.2,
            opacity: 0.38,
            color: "rgba(226,232,240,0.5)",
          },
        })),
        force: { repulsion: 138, edgeLength: 64 },
        label: { show: true, color: "#e2e8f0", fontSize: 10 },
      },
    ],
  };

  const signalChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 78, right: 22, top: 16, bottom: 24 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.1)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "category",
      data: derived.topSignals.map((entry) => entry.signal),
      axisLabel: { color: "#cbd5e1" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    series: [
      {
        type: "bar",
        data: derived.topSignals.map((entry) => entry.count),
        itemStyle: { color: "rgba(251,113,133,0.84)" },
      },
    ],
  };

  const backtestChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 44, right: 24, top: 16, bottom: 34 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: payload.backtest.dates,
      axisLabel: { color: "#94a3b8", hideOverlap: true },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
    },
    series: [
      {
        name: "Strategy (adjusted)",
        type: "line",
        data: derived.adjustedStrategy,
        smooth: 0.2,
        symbol: "none",
        lineStyle: { width: 2.4, color: "rgba(52,211,153,0.95)" },
        areaStyle: { color: "rgba(52,211,153,0.1)" },
      },
      {
        name: "Benchmark",
        type: "line",
        data: payload.backtest.benchmark,
        smooth: 0.2,
        symbol: "none",
        lineStyle: { width: 2, color: "rgba(148,163,184,0.85)" },
      },
    ],
  };

  return (
    <div className="space-y-8">
      <section className="neo-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-end">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-rose-100/85">
              Forensic Controls
            </p>
            <label className="flex flex-col gap-2 text-xs text-slate-400">
              Company
              <select
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100"
                value={derived.selectedTicker}
                onChange={(event) => setTicker(event.target.value)}
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
          label="Backtest Alpha (Ann.)"
          value={formatPct(payload.backtest.annualizedAlpha, { digits: 0 })}
          hint="Strategy vs benchmark"
          accent="emerald"
        />
      </div>

      <StoryChapterShell
        chapter="Chapter A"
        title="Risk chronology"
        description="Track filing-level regime shifts and compare raw vs weighted deception-adjusted risk."
        tone="crimson"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <EChart option={riskChart} height={340} title="Filing Risk Timeline" className="neo-panel" />
          <section className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Latest Filing Readout
              </p>
            </div>
            <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
              <p>
                <span className="text-slate-100">Date:</span>{" "}
                {derived.latest?.filingDate ?? "—"}
              </p>
              <p>
                <span className="text-slate-100">Beneish M:</span>{" "}
                {derived.latest ? formatNumber(derived.latest.beneishM, { digits: 2 }) : "—"}
              </p>
              <p>
                <span className="text-slate-100">MD&A sentiment:</span>{" "}
                {derived.latest ? formatNumber(derived.latest.sentiment, { digits: 2 }) : "—"}
              </p>
              <p>
                <span className="text-slate-100">Deception:</span>{" "}
                {derived.latest ? formatNumber(derived.latest.deception, { digits: 2 }) : "—"}
              </p>
            </div>
          </section>
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter B"
        title="Similarity clusters"
        description="Filter network links to isolate high-confidence resemblance to known fraud pattern structures."
        tone="crimson"
      >
        <EChart option={graphChart} height={430} title="Fraud Similarity Network" className="neo-panel" />
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter C"
        title="Signal attribution"
        description="Most frequent linguistic and accounting markers behind elevated forensic risk assignments."
        tone="amber"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <EChart option={signalChart} height={320} title="Top Trigger Signals" className="neo-panel" />
          <section className="glass rounded-2xl p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">
              Signal Stack
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {derived.topSignals.map((entry) => (
                <li key={entry.signal} className="flex items-center justify-between gap-3">
                  <span>{entry.signal}</span>
                  <span className="font-mono text-amber-100">{formatNumber(entry.count)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter D"
        title="Short portfolio outcome"
        description="Stress test the strategy path under varying short intensity and produce a ranked watchlist."
        tone="emerald"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <EChart option={backtestChart} height={360} title="Backtested Equity Path" className="neo-panel" />
          <section className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/90">
                Priority Watchlist
              </p>
            </div>
            <div className="space-y-2 px-5 py-5 text-sm text-slate-300">
              {derived.watchlist.map((item, index) => (
                <div key={`${item.ticker}-${item.date}`} className="flex items-center justify-between gap-3">
                  <p>
                    <span className="text-slate-500">{index + 1}.</span> {item.ticker}{" "}
                    <span className="text-slate-500">({item.date})</span>
                  </p>
                  <span className="font-mono text-rose-100">{formatPct(item.score, { digits: 0 })}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </StoryChapterShell>
    </div>
  );
}
