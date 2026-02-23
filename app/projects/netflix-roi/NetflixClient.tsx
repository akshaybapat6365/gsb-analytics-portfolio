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
import { clamp } from "@/lib/metrics/math";
import { formatNumber, formatUSD } from "@/lib/metrics/format";
import type { NetflixPayload } from "@/lib/schemas/netflix";

function pickChapterAnnotations(
  annotations: NonNullable<NetflixPayload["annotations"]>,
  keywords: string[],
) {
  const pool = annotations.filter((annotation) =>
    keywords.some((keyword) => annotation.moduleId.includes(keyword)),
  );
  return pool.length > 0 ? pool : annotations;
}

function compactTitle(title: string): string {
  if (title.length <= 24) return title;
  return `${title.slice(0, 22).trimEnd()}…`;
}

export default function NetflixClient({ payload }: { payload: NetflixPayload }) {
  const [budgetM, setBudgetM] = useState(90);
  const [buzz, setBuzz] = useState(66);
  const [acclaim, setAcclaim] = useState(74);
  const [retentionPriority, setRetentionPriority] = useState(58);
  const [buzzDecay, setBuzzDecay] = useState(44);
  const [selectedTitleId, setSelectedTitleId] = useState(payload.titles[0]?.id ?? "");

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
      const paybackMonths = clamp((title.costM / Math.max(1, weightedLtv)) * 14, 2, 36);
      return { ...title, weightedLtv, weightedRoi, paybackMonths };
    });

    const ranked = [...weightedTitles].sort((a, b) => b.weightedRoi - a.weightedRoi).slice(0, 10);
    const top = ranked[0] ?? weightedTitles[0];
    const selectedTitle = weightedTitles.find((title) => title.id === selectedTitleId) ?? top;

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

    const selectedFrontierPoint: [number, number] = [
      clamp(selectedTitle.acquisitionLtvM * (0.72 + buzzNorm * 0.22), 0, 220),
      clamp(selectedTitle.retentionLtvM * (0.8 + retentionWeight * 0.26), 0, 220),
    ];

    const stressCards = [
      {
        id: "base",
        label: "Base",
        addsM: Math.max(0, adds),
        retention: Math.max(0, retentionMonths),
      },
      {
        id: "upside",
        label: "Upside",
        addsM: Math.max(0, adds * 1.16),
        retention: Math.max(0, retentionMonths * 1.14),
      },
      {
        id: "downside",
        label: "Downside",
        addsM: Math.max(0, adds * 0.78),
        retention: Math.max(0, retentionMonths * 0.72),
      },
    ];

    const allocationRecommendation =
      selectedTitle.weightedRoi >= 2.2
        ? "greenlight and overweight"
        : selectedTitle.weightedRoi >= 1.5
          ? "greenlight with spend guardrails"
          : "hold or rework concept";

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
      selectedTitle,
      buzzTimeline,
      greenlightScore,
      selectedFrontierPoint,
      stressCards,
      allocationRecommendation,
    };
  }, [payload, budgetM, buzz, acclaim, retentionPriority, buzzDecay, selectedTitleId]);

  const bubbleChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 56, right: 24, top: 24, bottom: 44 },
    tooltip: {
      formatter: (param: unknown) => {
        const raw = param as { data?: unknown };
        const data = (raw.data ?? {}) as {
          title?: string;
          cost?: number;
          weightedLtv?: number;
          weightedRoi?: number;
          payback?: number;
        };
        return `${data.title ?? "Title"}<br/>Cost: $${(data.cost ?? 0).toFixed(0)}M<br/>Weighted LTV: $${(data.weightedLtv ?? 0).toFixed(0)}M<br/>Weighted ROI: ${(data.weightedRoi ?? 0).toFixed(2)}x<br/>Payback: ${(data.payback ?? 0).toFixed(1)} months`;
      },
    },
    xAxis: {
      type: "value",
      name: "Cost ($M)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Modeled weighted LTV ($M)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    graphic: [
      {
        type: "text",
        left: "18%",
        top: "16%",
        style: {
          text: "Scale",
          fill: "rgba(226,232,240,0.5)",
          fontSize: 11,
        },
      },
      {
        type: "text",
        left: "60%",
        top: "16%",
        style: {
          text: "Prestige-heavy",
          fill: "rgba(226,232,240,0.5)",
          fontSize: 11,
        },
      },
      {
        type: "text",
        left: "18%",
        top: "78%",
        style: {
          text: "Cheap low-value",
          fill: "rgba(226,232,240,0.45)",
          fontSize: 11,
        },
      },
      {
        type: "text",
        left: "63%",
        top: "78%",
        style: {
          text: "Overpriced risk",
          fill: "rgba(226,232,240,0.45)",
          fontSize: 11,
        },
      },
    ],
    series: [
      {
        type: "scatter",
        data: derived.weightedTitles.map((title) => ({
          title: title.title,
          cost: title.costM,
          weightedLtv: title.weightedLtv,
          weightedRoi: title.weightedRoi,
          payback: title.paybackMonths,
          acclaim: title.acclaim,
          value: [title.costM, title.weightedLtv, title.acclaim, title.weightedRoi],
        })),
        symbolSize: (value: unknown) => {
          const tuple = Array.isArray(value) ? value : [];
          const acclaimValue = typeof tuple[2] === "number" ? tuple[2] : 55;
          return 12 + acclaimValue * 0.34;
        },
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { data?: unknown };
            const data = (raw.data ?? {}) as { weightedRoi?: number };
            const roi = data.weightedRoi ?? 0;
            if (roi >= 3) return "rgba(73,95,69,0.86)";
            if (roi >= 2) return "rgba(139,107,62,0.86)";
            if (roi >= 1.2) return "rgba(139,107,62,0.75)";
            return "rgba(157,49,49,0.82)";
          },
        },
      },
    ],
  };

  const frontierChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 48, right: 24, top: 24, bottom: 38 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "value",
      name: "Acquisition power",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Retention value",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    series: [
      {
        type: "line",
        data: payload.paretoFrontier.map((point) => [point.acquisition, point.retention]),
        smooth: 0.24,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.2, color: "rgba(139,107,62,0.9)" },
        itemStyle: { color: "rgba(139,107,62,0.9)" },
      },
      {
        type: "scatter",
        data: [derived.selectedFrontierPoint],
        symbolSize: 16,
        itemStyle: { color: "rgba(73,95,69,0.95)" },
      },
      {
        type: "scatter",
        data: [[derived.predictedAddsM, derived.predictedRetentionMonths]],
        symbolSize: 14,
        itemStyle: { color: "rgba(157,49,49,0.9)" },
      },
    ],
  };

  const rankingChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 64, right: 24, top: 16, bottom: 32 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.1)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "category",
      data: derived.ranked.map((title) => title.title),
      axisLabel: { color: "#cbd5e1" },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    series: [
      {
        type: "bar",
        data: derived.ranked.map((title) => title.weightedRoi),
        itemStyle: { color: "rgba(73,95,69,0.86)" },
      },
    ],
  };

  const decayChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 48, right: 24, top: 18, bottom: 36 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: derived.buzzTimeline.map((point) => `W${point.week}`),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 100,
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: number) => `${Math.round(value)}%`,
      },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
    },
    series: [
      {
        name: "Buzz signal",
        type: "line",
        data: derived.buzzTimeline.map((point) => point.buzz),
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.4, color: "rgba(157,49,49,0.95)" },
        areaStyle: { color: "rgba(157,49,49,0.12)" },
      },
    ],
  };

  const annotations = payload.annotations ?? [];
  const chapterAAnnotations = pickChapterAnnotations(annotations, ["content", "allocation", "frontier", "matrix"]);
  const chapterBAnnotations = pickChapterAnnotations(annotations, ["frontier", "acquisition", "retention", "stress"]);
  const chapterCAnnotations = pickChapterAnnotations(annotations, ["recommendation", "greenlight", "decision"]);
  const chapterDAnnotations = pickChapterAnnotations(annotations, ["evidence", "recommendation"]);

  return (
    <div className="space-y-8">
      <RouteReveal profile="cinematic">
        <section className="neo-panel p-5">
          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">Allocation Controls</p>
              <p className="mt-2 text-sm text-slate-300">
                Budget and market assumptions for acquisition-retention tradeoff planning.
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
      </RouteReveal>

      <RouteReveal profile="cinematic" delay={0.05}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Predicted Adds"
            value={`${formatNumber(derived.predictedAddsM, { digits: 2 })}M`}
            hint="Scenario-estimated acquisition"
            accent="emerald"
          />
          <KpiCard
            label="Retention Months"
            value={formatNumber(derived.predictedRetentionMonths, { digits: 1 })}
            hint="Scenario persistence signal"
            accent="cyan"
          />
          <KpiCard
            label="Greenlight Score"
            value={formatNumber(derived.greenlightScore, { digits: 0 })}
            hint="Committee readiness"
            accent={derived.greenlightScore >= 60 ? "emerald" : "amber"}
          />
          <KpiCard
            label="Top Weighted Title"
            value={derived.top?.title ?? "—"}
            hint={derived.top ? `${formatNumber(derived.top.weightedRoi, { digits: 2 })}x weighted ROI` : ""}
            accent="amber"
          />
        </div>
      </RouteReveal>

      <RouteReveal profile="cinematic" delay={0.1}>
        <StoryChapterShell
          chapter="Primary Analysis"
          title="ROI bubble matrix"
          description="Cost vs modeled LTV with quadrant labels to frame greenlight strategy under explicit economics."
          insight={`Top weighted title ${derived.top?.title ?? "n/a"} at ${derived.top ? formatNumber(derived.top.weightedRoi, { digits: 2 }) : "—"}x ROI.`}
          impact="Quadrant framing separates scalable investment candidates from prestige-heavy capital sinks."
          annotationCount={chapterAAnnotations.length}
          tone="amber"
        >
          <EChart
            option={bubbleChart}
            height={620}
            mobileHeight={360}
            title="Content ROI Matrix"
            className="neo-panel"
          />
          <div className="glass rounded-2xl p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Title Selector</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {derived.ranked.slice(0, 8).map((title, index) => (
                <button
                  key={title.id}
                  type="button"
                  title={title.title}
                  onClick={() => setSelectedTitleId(title.id)}
                  className={
                    selectedTitleId === title.id
                      ? `rounded-full border border-amber-300/35 bg-amber-300/14 px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.1em] text-amber-100 ${index >= 5 ? "hidden sm:inline-flex" : ""}`
                      : `rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.1em] text-slate-300 hover:bg-white/[0.08] ${index >= 5 ? "hidden sm:inline-flex" : ""}`
                  }
                >
                  {compactTitle(title.title)}
                </button>
              ))}
            </div>
          </div>
          <NarrativeStrip
            title="Matrix Notes"
            subtitle="ROI matrix annotations identify which titles justify capital at committee hurdle rates."
            annotations={chapterAAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="cinematic" delay={0.14}>
        <StoryChapterShell
          chapter="Stress / Scenario"
          title="Frontier and stress board"
          description="Interactive frontier plus stress cards for base/upside/downside scenario framing."
          insight={`Selected title frontier point: ${formatNumber(derived.selectedFrontierPoint[0], { digits: 1 })} / ${formatNumber(derived.selectedFrontierPoint[1], { digits: 1 })}.`}
          impact="Stress card spread highlights how quickly ROI assumptions compress in downside cases."
          annotationCount={chapterBAnnotations.length}
          tone="cyan"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EChart
              option={frontierChart}
              height={560}
              mobileHeight={340}
              title="Acquisition-Retention Frontier"
              className="neo-panel"
            />
            <section className="terminal overflow-hidden" data-testid="decision-console">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Stress Compare Cards</p>
              </div>
              <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
                {derived.stressCards.map((card) => (
                  <article key={card.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400">{card.label}</p>
                    <p className="mt-1">Adds: <span className="font-mono text-amber-100">{formatNumber(card.addsM, { digits: 2 })}M</span></p>
                    <p className="mt-1">Retention: <span className="font-mono text-amber-100">{formatNumber(card.retention, { digits: 1 })} mo</span></p>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <EChart
              option={decayChart}
              height={520}
              mobileHeight={320}
              title="Buzz Decay Signal"
              className="neo-panel"
            />
            <EChart
              option={rankingChart}
              height={520}
              mobileHeight={320}
              title="Weighted ROI Ranking"
              className="neo-panel"
            />
          </div>
          <NarrativeStrip
            title="Scenario Notes"
            subtitle="Frontier movement and stress cards guide capital envelope changes under uncertainty."
            annotations={chapterBAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="cinematic" delay={0.18}>
        <StoryChapterShell
          chapter="Decision Console"
          title="Greenlight recommendation"
          description="Committee-style output: score, payback window, and capital allocation recommendation."
          insight={`Selected title ${derived.selectedTitle.title} payback ${formatNumber(derived.selectedTitle.paybackMonths, { digits: 1 })} months.`}
          impact={`Allocation recommendation: ${derived.allocationRecommendation}.`}
          annotationCount={chapterCAnnotations.length}
          tone="emerald"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="glass rounded-2xl p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/90">Selected Title Board</p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p><span className="text-slate-100">Title:</span> {derived.selectedTitle.title}</p>
                <p><span className="text-slate-100">Weighted ROI:</span> {formatNumber(derived.selectedTitle.weightedRoi, { digits: 2 })}x</p>
                <p><span className="text-slate-100">Modeled LTV:</span> {formatUSD(derived.selectedTitle.weightedLtv * 1_000_000)}</p>
                <p><span className="text-slate-100">Payback:</span> {formatNumber(derived.selectedTitle.paybackMonths, { digits: 1 })} months</p>
              </div>
            </section>
            <DecisionConsole
              lines={[
                {
                  label: "Greenlight score",
                  value: formatNumber(derived.greenlightScore, { digits: 0 }),
                  tone: derived.greenlightScore >= 60 ? "emerald" : "amber",
                },
                {
                  label: "Capital recommendation",
                  value: derived.allocationRecommendation,
                  tone: "amber",
                },
                {
                  label: "Expected payback window",
                  value: `${formatNumber(derived.selectedTitle.paybackMonths, { digits: 1 })} months`,
                  tone: "emerald",
                },
                {
                  label: "Predicted adds / retention",
                  value: `${formatNumber(derived.predictedAddsM, { digits: 2 })}M / ${formatNumber(derived.predictedRetentionMonths, { digits: 1 })} mo`,
                  tone: "neutral",
                },
              ]}
            />
          </div>
          <NarrativeStrip
            title="Decision Notes"
            subtitle="Committee recommendation combines score, payback, and frontier position under current scenario."
            annotations={chapterCAnnotations}
            tone="emerald"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="cinematic" delay={0.22}>
        <StoryChapterShell
          chapter="Evidence"
          title="Recommendation evidence trace"
          description="Annotation and evidence packet connecting model outputs to committee recommendation."
          insight={`Evidence packets available: ${formatNumber(payload.decisionEvidence?.length ?? 0)}.`}
          impact="Creates auditable linkage between scenario assumptions and final greenlight action."
          annotationCount={chapterDAnnotations.length}
          tone="amber"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <NarrativeStrip
              title="Evidence Callouts"
              subtitle="Source-linked annotations supporting current committee recommendation."
              annotations={chapterDAnnotations}
              tone="amber"
              maxItems={6}
            />
            <DecisionEvidencePanel title="Greenlight Evidence" evidence={payload.decisionEvidence} />
          </div>
        </StoryChapterShell>
      </RouteReveal>
    </div>
  );
}
