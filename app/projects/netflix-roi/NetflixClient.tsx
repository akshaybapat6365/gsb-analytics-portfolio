"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/viz/EChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { Slider } from "@/components/ui/Slider";
import { StoryChapterShell } from "@/components/story/StoryChapterShell";
import { clamp } from "@/lib/metrics/math";
import { formatNumber, formatPct } from "@/lib/metrics/format";
import type { NetflixPayload } from "@/lib/schemas/netflix";

export default function NetflixClient({ payload }: { payload: NetflixPayload }) {
  const [budgetM, setBudgetM] = useState(90);
  const [buzz, setBuzz] = useState(66);
  const [acclaim, setAcclaim] = useState(74);
  const [retentionPriority, setRetentionPriority] = useState(58);
  const [buzzDecay, setBuzzDecay] = useState(44);

  const derived = useMemo(() => {
    const budget = clamp(budgetM, 5, 250);
    const buzzNorm = clamp(buzz / 100, 0, 1);
    const acclaimNorm = clamp(acclaim / 100, 0, 1);
    const retentionWeight = clamp(retentionPriority / 100, 0, 1);
    const decay = clamp(buzzDecay / 100, 0, 1);

    const adds =
      payload.model.acquisitionAddsCoeff.intercept +
      payload.model.acquisitionAddsCoeff.budget * budget +
      payload.model.acquisitionAddsCoeff.buzz * buzzNorm * (1 - decay * 0.3) +
      payload.model.acquisitionAddsCoeff.acclaim * acclaimNorm;

    const retentionMonths =
      payload.model.retentionMonthsCoeff.intercept +
      payload.model.retentionMonthsCoeff.budget * budget * (0.85 + retentionWeight * 0.35) +
      payload.model.retentionMonthsCoeff.buzz * buzzNorm * (1 - decay * 0.45) +
      payload.model.retentionMonthsCoeff.acclaim * acclaimNorm;

    const weightedTitles = payload.titles.map((title) => {
      const weightedLtv =
        title.acquisitionLtvM * (1 - retentionWeight) +
        title.retentionLtvM * retentionWeight;
      const weightedRoi = weightedLtv / Math.max(1, title.costM);
      return { ...title, weightedLtv, weightedRoi };
    });

    const ranked = [...weightedTitles]
      .sort((a, b) => b.weightedRoi - a.weightedRoi)
      .slice(0, 8);
    const top = ranked[0] ?? weightedTitles[0];

    const buzzTimeline = Array.from({ length: 12 }, (_, idx) => {
      const week = idx + 1;
      const baseline = buzzNorm * Math.exp(-decay * 0.22 * idx);
      const momentum = acclaimNorm * 0.12 * Math.exp(-0.08 * idx);
      return {
        week,
        buzz: clamp((baseline + momentum) * 100, 0, 100),
      };
    });

    const greenlightScore = clamp(
      (Math.max(0, adds) * 0.22 + Math.max(0, retentionMonths) * 0.78) / 10,
      0,
      100,
    );

    return {
      budget,
      buzzNorm,
      acclaimNorm,
      retentionWeight,
      decay,
      predictedAddsM: Math.max(0, adds),
      predictedRetentionMonths: Math.max(0, retentionMonths),
      weightedTitles,
      ranked,
      top,
      buzzTimeline,
      greenlightScore,
    };
  }, [payload, budgetM, buzz, acclaim, retentionPriority, buzzDecay]);

  const bubbleChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 54, right: 22, top: 20, bottom: 40 },
    tooltip: {
      formatter: (param: unknown) => {
        const raw = param as { data?: unknown };
        const data = (raw.data ?? {}) as {
          title?: string;
          cost?: number;
          weightedLtv?: number;
          weightedRoi?: number;
        };
        return `${data.title ?? "Title"}<br/>Cost: $${(data.cost ?? 0).toFixed(0)}M<br/>Weighted LTV: $${(data.weightedLtv ?? 0).toFixed(0)}M<br/>Weighted ROI: ${(data.weightedRoi ?? 0).toFixed(2)}x`;
      },
    },
    xAxis: {
      type: "value",
      name: "Cost ($M)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Weighted LTV ($M)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    series: [
      {
        type: "scatter",
        data: derived.weightedTitles.map((title) => ({
          title: title.title,
          cost: title.costM,
          weightedLtv: title.weightedLtv,
          weightedRoi: title.weightedRoi,
          acclaim: title.acclaim,
          value: [title.costM, title.weightedLtv, title.acclaim, title.weightedRoi],
        })),
        symbolSize: (value: unknown) => {
          const tuple = Array.isArray(value) ? value : [];
          const acclaimValue = typeof tuple[2] === "number" ? tuple[2] : 55;
          return 12 + acclaimValue * 0.32;
        },
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { data?: unknown };
            const data = (raw.data ?? {}) as { weightedRoi?: number };
            const roi = data.weightedRoi ?? 0;
            if (roi >= 3) return "rgba(52,211,153,0.82)";
            if (roi >= 2) return "rgba(34,211,238,0.82)";
            if (roi >= 1.2) return "rgba(251,191,36,0.8)";
            return "rgba(251,113,133,0.8)";
          },
        },
      },
    ],
  };

  const frontierChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 46, right: 22, top: 20, bottom: 34 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "value",
      name: "Acquisition power",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Retention value",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    series: [
      {
        type: "line",
        data: payload.paretoFrontier.map((point) => [point.acquisition, point.retention]),
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.2, color: "rgba(34,211,238,0.9)" },
        itemStyle: { color: "rgba(34,211,238,0.9)" },
      },
      {
        type: "scatter",
        data: [[derived.predictedAddsM, derived.predictedRetentionMonths]],
        symbolSize: 16,
        itemStyle: { color: "rgba(251,191,36,0.95)" },
      },
    ],
  };

  const decayChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 46, right: 24, top: 18, bottom: 34 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: derived.buzzTimeline.map((point) => `W${point.week}`),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: number) => `${Math.round(value)}%`,
      },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
    },
    series: [
      {
        name: "Buzz signal",
        type: "line",
        data: derived.buzzTimeline.map((point) => point.buzz),
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.4, color: "rgba(251,113,133,0.95)" },
        areaStyle: { color: "rgba(251,113,133,0.12)" },
      },
    ],
  };

  const rankingChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 60, right: 24, top: 14, bottom: 26 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.1)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "category",
      data: derived.ranked.map((title) => title.title),
      axisLabel: { color: "#cbd5e1" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    series: [
      {
        type: "bar",
        data: derived.ranked.map((title) => title.weightedRoi),
        itemStyle: { color: "rgba(52,211,153,0.82)" },
      },
    ],
  };

  return (
    <div className="space-y-8">
      <section className="neo-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">
              Portfolio Controls
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Set budget and creative-market assumptions to stress test greenlight
              economics across acquisition and retention.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Slider
              label="Budget"
              value={budgetM}
              min={5}
              max={250}
              step={1}
              onChange={setBudgetM}
              formatValue={(value) => `$${value}M`}
            />
            <Slider
              label="Buzz"
              value={buzz}
              min={0}
              max={100}
              step={1}
              onChange={setBuzz}
              formatValue={(value) => `${value}%`}
            />
            <Slider
              label="Critical acclaim"
              value={acclaim}
              min={0}
              max={100}
              step={1}
              onChange={setAcclaim}
              formatValue={(value) => `${value}%`}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Slider
            label="Retention priority"
            value={retentionPriority}
            min={0}
            max={100}
            step={1}
            onChange={setRetentionPriority}
            formatValue={(value) => `${value}%`}
          />
          <Slider
            label="Buzz decay intensity"
            value={buzzDecay}
            min={0}
            max={100}
            step={1}
            onChange={setBuzzDecay}
            formatValue={(value) => `${value}%`}
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Predicted Adds"
          value={`${formatNumber(derived.predictedAddsM, { digits: 2 })}M`}
          hint="Scenario-estimated incremental acquisition"
          accent="emerald"
        />
        <KpiCard
          label="Retention Months"
          value={formatNumber(derived.predictedRetentionMonths, { digits: 1 })}
          hint="Scenario-estimated persistence signal"
          accent="cyan"
        />
        <KpiCard
          label="Greenlight Score"
          value={formatNumber(derived.greenlightScore, { digits: 0 })}
          hint="Weighted committee readiness metric"
          accent={derived.greenlightScore >= 60 ? "emerald" : "amber"}
        />
        <KpiCard
          label="Top Weighted Title"
          value={derived.top?.title ?? "—"}
          hint={derived.top ? `${formatNumber(derived.top.weightedRoi, { digits: 2 })}x weighted ROI` : ""}
          accent="amber"
        />
      </div>

      <StoryChapterShell
        chapter="Chapter A"
        title="Weighted ROI matrix"
        description="Plot titles by cost and weighted value. Bubble color encodes weighted ROI under current committee priorities."
        tone="amber"
      >
        <EChart option={bubbleChart} height={430} title="Content ROI Matrix" className="neo-panel" />
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter B"
        title="Acquisition-retention frontier"
        description="Compare scenario output to efficient frontier; yellow marker is current simulation under your assumptions."
        tone="cyan"
      >
        <EChart option={frontierChart} height={320} title="Frontier + Scenario Marker" className="neo-panel" />
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter C"
        title="Buzz half-life dynamics"
        description="Track how launch buzz decays across 12 weeks and estimate content shelf-life pressure."
        tone="crimson"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <EChart option={decayChart} height={300} title="Buzz Decay Curve" className="neo-panel" />
          <section className="glass rounded-2xl p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rose-100/90">
              Launch Memo
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-100">Week-1 buzz:</span>{" "}
                {formatPct(derived.buzzTimeline[0]?.buzz ? derived.buzzTimeline[0]!.buzz / 100 : 0, { digits: 0 })}
              </p>
              <p>
                <span className="text-slate-100">Week-12 buzz:</span>{" "}
                {formatPct(derived.buzzTimeline.at(-1)?.buzz ? derived.buzzTimeline.at(-1)!.buzz / 100 : 0, { digits: 0 })}
              </p>
              <p>
                <span className="text-slate-100">Strategy:</span>{" "}
                {derived.buzzTimeline.at(-1)?.buzz && derived.buzzTimeline.at(-1)!.buzz > 30
                  ? "Retention tail is durable"
                  : "Needs post-launch amplification"}
              </p>
            </div>
          </section>
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter D"
        title="Greenlight slate ranking"
        description="Rank titles by weighted ROI to produce a transparent committee-ready shortlist."
        tone="emerald"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <EChart option={rankingChart} height={340} title="Weighted ROI Ranking" className="neo-panel" />
          <section className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/90">
                Greenlight Output
              </p>
            </div>
            <div className="space-y-2 px-5 py-5 text-sm text-slate-300">
              {derived.ranked.map((title, index) => (
                <div key={title.id} className="flex items-center justify-between gap-3">
                  <p>
                    <span className="text-slate-500">{index + 1}.</span> {title.title}
                  </p>
                  <span className="font-mono text-emerald-100">
                    {formatNumber(title.weightedRoi, { digits: 2 })}x
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </StoryChapterShell>
    </div>
  );
}
