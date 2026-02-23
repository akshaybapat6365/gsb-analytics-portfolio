"use client";

import { useMemo, useState } from "react";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { Layer, PickingInfo } from "@deck.gl/core";
import type { EChartsOption } from "echarts";
import { DeckMap } from "@/components/viz/DeckMap";
import { EChart } from "@/components/viz/EChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { Slider } from "@/components/ui/Slider";
import { StoryChapterShell } from "@/components/story/StoryChapterShell";
import { RouteReveal } from "@/components/motion/RouteReveal";
import { NarrativeStrip } from "@/components/story/NarrativeStrip";
import { DecisionEvidencePanel } from "@/components/story/DecisionEvidencePanel";
import { DecisionConsole } from "@/components/story/DecisionConsole";
import { clamp } from "@/lib/metrics/math";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";

const STORE_COLORS = {
  Convert: new Uint8ClampedArray([34, 211, 238, 208]),
  Lockers: new Uint8ClampedArray([52, 211, 153, 206]),
  Close: new Uint8ClampedArray([251, 113, 133, 214]),
} as const;

const SEGMENTS = ["all", "office", "mixed", "residential"] as const;
type SegmentFilter = (typeof SEGMENTS)[number];

function colorFor(rec: "Convert" | "Lockers" | "Close") {
  return STORE_COLORS[rec];
}

function rgba(color: Uint8ClampedArray, alpha = 0.84) {
  return `rgba(${color[0]},${color[1]},${color[2]},${alpha})`;
}

function pickChapterAnnotations(
  annotations: NonNullable<StarbucksPayload["annotations"]>,
  keywords: string[],
) {
  const pool = annotations.filter((annotation) =>
    keywords.some((keyword) => annotation.moduleId.includes(keyword)),
  );
  return pool.length > 0 ? pool : annotations;
}

export default function StarbucksClient({ payload }: { payload: StarbucksPayload }) {
  const [wfh, setWfh] = useState(58);
  const [officeShock, setOfficeShock] = useState(42);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string>(payload.stores[0]?.id ?? "");
  const [placeboMode, setPlaceboMode] = useState(false);

  const derived = useMemo(() => {
    const w = clamp(wfh / 100, 0, 1);
    const office = clamp(officeShock / 100, 0, 1);

    const stores = payload.stores.map((store) => {
      const segmentShock =
        store.segment === "office"
          ? office * 0.34
          : store.segment === "mixed"
            ? office * 0.18
            : -office * 0.08;
      const trafficMultiplier = clamp(
        1 - w * store.wfhExposure * 0.86 - segmentShock,
        0.34,
        1.3,
      );
      const traffic = store.baselineTraffic * trafficMultiplier;
      const profitK =
        store.baselineProfitK +
        store.deltaProfitK * w +
        (store.segment === "residential" ? 12 * office : -10 * office);
      const confidence = clamp(
        (Math.abs(store.deltaProfitK) / 120 + store.wfhExposure) / 2,
        0,
        1,
      );

      return { ...store, traffic, profitK, confidence, trafficMultiplier };
    });

    const visibleStores =
      segmentFilter === "all"
        ? stores
        : stores.filter((store) => store.segment === segmentFilter);

    const byRec = visibleStores.reduce<Record<string, number>>((acc, store) => {
      acc[store.recommendation] = (acc[store.recommendation] ?? 0) + 1;
      return acc;
    }, {});

    const totalDeltaProfitK = visibleStores.reduce(
      (sum, store) => sum + (store.profitK - store.baselineProfitK),
      0,
    );
    const avgTraffic =
      visibleStores.reduce((sum, store) => sum + store.traffic, 0) /
      Math.max(1, visibleStores.length);

    const segmentStats = ["office", "mixed", "residential"].map((segment) => {
      const rows = stores.filter((store) => store.segment === segment);
      const baselineTraffic = rows.reduce((sum, store) => sum + store.baselineTraffic, 0);
      const scenarioTraffic = rows.reduce((sum, store) => sum + store.traffic, 0);
      const baselineProfitK = rows.reduce((sum, store) => sum + store.baselineProfitK, 0);
      const scenarioProfitK = rows.reduce((sum, store) => sum + store.profitK, 0);
      return {
        segment,
        baselineTraffic,
        scenarioTraffic,
        baselineProfitK,
        scenarioProfitK,
      };
    });

    const selectedStore =
      stores.find((store) => store.id === selectedStoreId) ??
      visibleStores[0] ??
      stores[0];

    const ranked = [...visibleStores]
      .sort((a, b) => b.profitK - b.baselineProfitK - (a.profitK - a.baselineProfitK))
      .slice(0, 10);

    const scenarios = [...payload.scenarios].sort((a, b) => a.wfhIndex - b.wfhIndex);
    const treatmentSeries = scenarios.map((row) => {
      const base = row.trafficMultiplier;
      const shift = placeboMode ? 0.01 : office * 0.18 + payload.did.ate * 0.15;
      return clamp(base - shift, 0.3, 1.35);
    });
    const controlSeries = scenarios.map((row) => {
      const base = row.trafficMultiplier;
      const shift = placeboMode ? 0.008 : office * 0.06;
      return clamp(base - shift, 0.32, 1.35);
    });

    const divergenceSeries = treatmentSeries.map((value, idx) => value - controlSeries[idx]!);
    const ciBand = Math.max(0.01, (payload.did.ci[1] - payload.did.ci[0]) / 2);

    return {
      w,
      office,
      stores,
      visibleStores,
      byRec,
      totalDeltaProfitK,
      avgTraffic,
      segmentStats,
      selectedStore,
      ranked,
      scenarios,
      treatmentSeries,
      controlSeries,
      divergenceSeries,
      ciBand,
    };
  }, [payload, wfh, officeShock, segmentFilter, selectedStoreId, placeboMode]);

  type Store = (typeof derived.stores)[number];

  const layers: Layer[] = [
    new ScatterplotLayer<Store>({
      id: "starbucks-stores",
      data: derived.visibleStores,
      getPosition: (store) => [store.lon, store.lat],
      getRadius: (store) => 42 + Math.sqrt(store.traffic) * 2.8 + store.confidence * 18,
      radiusMinPixels: 3,
      radiusMaxPixels: 34,
      getFillColor: (store) => colorFor(store.recommendation),
      getLineColor: (store) =>
        store.id === derived.selectedStore?.id
          ? new Uint8ClampedArray([251, 191, 36, 230])
          : new Uint8ClampedArray([226, 232, 240, 140]),
      lineWidthMinPixels: 1,
      opacity: 0.9,
      stroked: true,
      pickable: true,
      onClick: (info: PickingInfo) => {
        const obj = info.object as Store | null;
        if (obj?.id) {
          setSelectedStoreId(obj.id);
        }
      },
    }),
  ];

  const recChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 44, right: 22, top: 22, bottom: 34 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: ["Convert", "Lockers", "Close"],
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
    },
    series: [
      {
        name: "Store count",
        type: "bar",
        data: ["Convert", "Lockers", "Close"].map((key) => derived.byRec[key] ?? 0),
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { name?: unknown };
            const name =
              raw.name === "Convert" || raw.name === "Lockers" || raw.name === "Close"
                ? (raw.name as "Convert" | "Lockers" | "Close")
                : "Lockers";
            const c = colorFor(name);
            return `rgba(${c[0]},${c[1]},${c[2]},0.84)`;
          },
        },
      },
    ],
  };

  const didPretrendChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 22, top: 24, bottom: 42 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: derived.scenarios.map((scenario) => `${Math.round(scenario.wfhIndex * 100)}%`),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
    },
    series: [
      {
        name: "Treatment",
        type: "line",
        data: derived.treatmentSeries,
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2.4, color: "rgba(139,107,62,0.95)" },
      },
      {
        name: "Control",
        type: "line",
        data: derived.controlSeries,
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2.4, color: "rgba(73,95,69,0.92)" },
      },
    ],
  };

  const divergenceChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 22, top: 24, bottom: 42 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: derived.scenarios.map((scenario) => `${Math.round(scenario.wfhIndex * 100)}%`),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
      },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
    },
    series: [
      {
        name: "Divergence",
        type: "line",
        data: derived.divergenceSeries,
        smooth: 0.24,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.6, color: "rgba(157,49,49,0.92)" },
        areaStyle: { color: "rgba(157,49,49,0.12)" },
      },
      {
        name: "CI upper",
        type: "line",
        data: derived.divergenceSeries.map((value) => value + derived.ciBand),
        smooth: 0.22,
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(182,169,151,0.45)" },
      },
      {
        name: "CI lower",
        type: "line",
        data: derived.divergenceSeries.map((value) => value - derived.ciBand),
        smooth: 0.22,
        symbol: "none",
        lineStyle: { width: 1, color: "rgba(182,169,151,0.45)" },
        areaStyle: { color: "rgba(182,169,151,0.08)" },
      },
    ],
  };

  const storeScatter: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 56, right: 26, top: 22, bottom: 44 },
    tooltip: {
      formatter: (param: unknown) => {
        const raw = param as { data?: unknown };
        const data = (raw.data ?? {}) as {
          name?: string;
          exposure?: number;
          delta?: number;
          confidence?: number;
        };
        return `${data.name ?? "Store"}<br/>WFH exposure: ${Math.round((data.exposure ?? 0) * 100)}%<br/>Projected delta: ${formatUSD((data.delta ?? 0) * 1000)}<br/>Confidence: ${Math.round((data.confidence ?? 0) * 100)}%`;
      },
    },
    xAxis: {
      type: "value",
      name: "WFH exposure",
      min: 0,
      max: 1,
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: number) => `${Math.round(value * 100)}%`,
      },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Projected delta profit ($K)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    series: [
      {
        type: "scatter",
        data: derived.visibleStores.map((store) => ({
          name: store.name,
          exposure: store.wfhExposure,
          delta: store.profitK - store.baselineProfitK,
          confidence: store.confidence,
          value: [store.wfhExposure, store.profitK - store.baselineProfitK, store.confidence],
          itemStyle: { color: rgba(colorFor(store.recommendation), 0.86) },
        })),
        symbolSize: (value: unknown) => {
          const tuple = Array.isArray(value) ? value : [];
          const confidence = typeof tuple[2] === "number" ? tuple[2] : 0.4;
          return 12 + confidence * 20;
        },
      },
    ],
  };

  const annotations = payload.annotations ?? [];
  const chapterAAnnotations = pickChapterAnnotations(annotations, ["portfolio", "surgery", "store", "map"]);
  const chapterBAnnotations = pickChapterAnnotations(annotations, ["segment", "did", "causal"]);
  const chapterCAnnotations = pickChapterAnnotations(annotations, ["recommendation", "matrix", "decision"]);
  const chapterDAnnotations = pickChapterAnnotations(annotations, ["evidence", "recommendation"]);

  return (
    <div className="space-y-8">
      <RouteReveal profile="geo">
        <section className="neo-panel p-5">
          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-100/90">Portfolio Surgeon Controls</p>
              <p className="mt-2 text-sm text-slate-300">
                Stress WFH migration and office shock while preserving clear
                recommendation explainability.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Slider
                label="WFH index"
                value={wfh}
                min={0}
                max={100}
                step={1}
                onChange={setWfh}
                formatValue={(value) => `${value}%`}
              />
              <Slider
                label="Office park shock"
                value={officeShock}
                min={0}
                max={100}
                step={1}
                onChange={setOfficeShock}
                formatValue={(value) => `${value}%`}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {SEGMENTS.map((segment) => (
              <button
                key={segment}
                type="button"
                onClick={() => setSegmentFilter(segment)}
                className={
                  segmentFilter === segment
                    ? "rounded-full border border-emerald-300/35 bg-emerald-300/16 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-100"
                    : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.08]"
                }
              >
                {segment}
              </button>
            ))}
          </div>
        </section>
      </RouteReveal>

      <RouteReveal profile="geo" delay={0.05}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="DiD ATE"
            value={formatPct(payload.did.ate, { digits: 0 })}
            hint={`95% CI ${formatPct(payload.did.ci[0], { digits: 0 })} to ${formatPct(payload.did.ci[1], { digits: 0 })}`}
            accent="emerald"
          />
          <KpiCard
            label="Visible Store Set"
            value={formatNumber(derived.visibleStores.length)}
            hint={`Filter: ${segmentFilter.toUpperCase()}`}
            accent="cyan"
          />
          <KpiCard
            label="Portfolio Delta"
            value={formatUSD(derived.totalDeltaProfitK * 1000)}
            hint="Scenario vs baseline"
            accent={derived.totalDeltaProfitK >= 0 ? "emerald" : "crimson"}
          />
          <KpiCard
            label="Avg Traffic"
            value={formatNumber(derived.avgTraffic, { digits: 0 })}
            hint="Scenario-adjusted"
            accent="amber"
          />
        </div>
      </RouteReveal>

      <RouteReveal profile="geo" delay={0.1}>
        <StoryChapterShell
          chapter="Primary Analysis"
          title="Geo portfolio map"
          description="Map-led strategy board with recommendation color coding, confidence-based sizing, and pinned store surgery detail."
          insight={`${derived.selectedStore?.name ?? "Selected store"} recommendation: ${derived.selectedStore?.recommendation ?? "n/a"}.`}
          impact={`Scenario portfolio delta ${formatUSD(derived.totalDeltaProfitK * 1000)} across visible stores.`}
          annotationCount={chapterAAnnotations.length}
          tone="emerald"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <DeckMap
              initialViewState={{
                longitude: payload.city.center[0],
                latitude: payload.city.center[1],
                zoom: payload.city.zoom,
                pitch: 44,
                bearing: -14,
              }}
              layers={layers}
              height={640}
              className="neo-panel"
              getTooltip={(info: PickingInfo) => {
                const obj = info.object as Store | null;
                if (!obj) return null;
                return `${obj.name}\n${obj.recommendation}\nProjected delta: ${formatUSD((obj.profitK - obj.baselineProfitK) * 1000)}\nConfidence: ${formatPct(obj.confidence, { digits: 0 })}`;
              }}
            />
            <section className="terminal overflow-hidden" data-testid="decision-console">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/90">Pinned Store Panel</p>
              </div>
              <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
                <p><span className="text-slate-100">Store:</span> {derived.selectedStore?.name ?? "—"}</p>
                <p><span className="text-slate-100">Recommendation:</span> {derived.selectedStore?.recommendation ?? "—"}</p>
                <p>
                  <span className="text-slate-100">Projected delta:</span>{" "}
                  {derived.selectedStore
                    ? formatUSD((derived.selectedStore.profitK - derived.selectedStore.baselineProfitK) * 1000)
                    : "—"}
                </p>
                <p>
                  <span className="text-slate-100">Confidence:</span>{" "}
                  {derived.selectedStore
                    ? formatPct(derived.selectedStore.confidence, { digits: 0 })
                    : "—"}
                </p>
              </div>
            </section>
          </div>
          <NarrativeStrip
            title="Geo Narrative"
            subtitle="Store-level shifts expose where office-park collapse and suburban pull diverge."
            annotations={chapterAAnnotations}
            tone="emerald"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="geo" delay={0.14}>
        <StoryChapterShell
          chapter="Stress / Scenario"
          title="DiD causal board"
          description="Pre-trend and treatment-control divergence with confidence ribbon plus placebo falsification toggle."
          insight={`Pre-trend p-value ${formatNumber(payload.did.pretrendP, { digits: 2 })}; placebo ${placeboMode ? "on" : "off"}.`}
          impact="Divergence confidence helps avoid over-allocating conversions when causal confidence weakens."
          annotationCount={chapterBAnnotations.length}
          tone="cyan"
        >
          <div className="glass rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Causal Stress Toggles</p>
              <button
                type="button"
                onClick={() => setPlaceboMode((prev) => !prev)}
                className={
                  placeboMode
                    ? "rounded-full border border-rose-300/35 bg-rose-300/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-rose-100"
                    : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300"
                }
              >
                placebo {placeboMode ? "on" : "off"}
              </button>
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <EChart option={didPretrendChart} height={560} title="Pre-trend Validation (Treatment vs Control)" className="neo-panel" />
            <EChart option={divergenceChart} height={560} title="Treatment-Control Divergence + CI" className="neo-panel" />
          </div>
          <NarrativeStrip
            title="Causal Notes"
            subtitle="Use placebo mode to inspect whether divergence survives falsification pressure."
            annotations={chapterBAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="geo" delay={0.18}>
        <StoryChapterShell
          chapter="Decision Console"
          title="Store surgery matrix and action queue"
          description="Quadrant-style matrix for WFH exposure vs profit delta, plus top-10 implementation sequence."
          insight={`Top candidate: ${derived.ranked[0]?.name ?? "n/a"} at ${derived.ranked[0] ? formatUSD((derived.ranked[0].profitK - derived.ranked[0].baselineProfitK) * 1000) : "—"} delta.`}
          impact="Queue ranking prioritizes fastest recoverable economics under current commuter assumptions."
          annotationCount={chapterCAnnotations.length}
          tone="amber"
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <EChart option={storeScatter} height={560} title="Store Surgery Matrix (Exposure × Delta)" className="neo-panel" />
            <EChart option={recChart} height={560} title="Recommendation Composition" className="neo-panel" />
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <DecisionConsole
              lines={[
                {
                  label: "Portfolio delta",
                  value: formatUSD(derived.totalDeltaProfitK * 1000),
                  tone: derived.totalDeltaProfitK >= 0 ? "emerald" : "crimson",
                },
                {
                  label: "Convert / Lockers / Close",
                  value: `${formatNumber(derived.byRec.Convert ?? 0)} / ${formatNumber(derived.byRec.Lockers ?? 0)} / ${formatNumber(derived.byRec.Close ?? 0)}`,
                  tone: "amber",
                },
                {
                  label: "Priority #1",
                  value: derived.ranked[0]?.name ?? "—",
                  tone: "emerald",
                },
                {
                  label: "Implementation queue",
                  value: `${formatNumber(derived.ranked.length)} stores`,
                  tone: "neutral",
                },
              ]}
            />
            <DecisionConsole
              lines={[
                {
                  label: "Top queue node",
                  value: derived.ranked[0]?.name ?? "—",
                  tone: "emerald",
                },
                {
                  label: "Top queue delta",
                  value: derived.ranked[0] ? formatUSD((derived.ranked[0].profitK - derived.ranked[0].baselineProfitK) * 1000) : "—",
                  tone: "amber",
                },
                {
                  label: "DiD confidence window",
                  value: `${formatPct(payload.did.ci[0], { digits: 0 })} → ${formatPct(payload.did.ci[1], { digits: 0 })}`,
                  tone: "neutral",
                },
                {
                  label: "Pretrend p-value",
                  value: formatNumber(payload.did.pretrendP, { digits: 2 }),
                  tone: payload.did.pretrendP > 0.1 ? "emerald" : "crimson",
                },
              ]}
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <NarrativeStrip
              title="Decision Notes"
              subtitle="Quadrant and queue pair together for execution-ready portfolio surgery sequencing."
              annotations={chapterCAnnotations}
              tone="amber"
              maxItems={5}
            />
            <section className="glass rounded-2xl p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Top-10 Queue</p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                {derived.ranked.map((store, index) => (
                  <div key={store.id} className="flex items-center justify-between gap-3">
                    <p>
                      <span className="text-slate-500">{index + 1}.</span> {store.name}
                    </p>
                    <span className="font-mono text-emerald-100">
                      {formatUSD((store.profitK - store.baselineProfitK) * 1000)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="geo" delay={0.22}>
        <StoryChapterShell
          chapter="Evidence"
          title="Recommendation evidence trace"
          description="Source-linked annotation evidence and decision packet for committee-style review."
          insight={`Evidence packets available: ${formatNumber(payload.decisionEvidence?.length ?? 0)}.`}
          impact="Improves governance quality by binding each action recommendation to explicit supporting evidence."
          annotationCount={chapterDAnnotations.length}
          tone="emerald"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <NarrativeStrip
              title="Evidence Callouts"
              subtitle="Key annotation clusters backing conversion, locker, and closure decisions."
              annotations={chapterDAnnotations}
              tone="emerald"
              maxItems={6}
            />
            <DecisionEvidencePanel title="Portfolio Surgery Evidence" evidence={payload.decisionEvidence} />
          </div>
        </StoryChapterShell>
      </RouteReveal>
    </div>
  );
}
