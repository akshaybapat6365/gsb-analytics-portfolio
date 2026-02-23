"use client";

import { useMemo, useState } from "react";
import type { Layer, PickingInfo } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
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
import { formatNumber, formatUSD } from "@/lib/metrics/format";
import { clamp } from "@/lib/metrics/math";
import type { EvPayload } from "@/lib/schemas/ev";

const STATION_COLORS = {
  Tesla: new Uint8ClampedArray([34, 211, 238, 210]),
  EA: new Uint8ClampedArray([251, 191, 36, 212]),
  Other: new Uint8ClampedArray([148, 163, 184, 190]),
} as const;

const FLOW_COLORS = {
  Tesla: new Uint8ClampedArray([34, 211, 238, 130]),
  Ford: new Uint8ClampedArray([52, 211, 153, 128]),
  GM: new Uint8ClampedArray([251, 113, 133, 125]),
  Other: new Uint8ClampedArray([148, 163, 184, 88]),
} as const;

type NodeState = "build" | "hold" | "abandon";

function stationColor(brand: "Tesla" | "EA" | "Other") {
  return STATION_COLORS[brand];
}

function flowColor(brand: "Tesla" | "Ford" | "GM" | "Other") {
  return FLOW_COLORS[brand];
}

function pickChapterAnnotations(
  annotations: NonNullable<EvPayload["annotations"]>,
  keywords: string[],
) {
  const pool = annotations.filter((annotation) =>
    keywords.some((keyword) => annotation.moduleId.includes(keyword)),
  );
  return pool.length > 0 ? pool : annotations;
}

export default function EvClient({ payload }: { payload: EvPayload }) {
  const [selectedSiteId, setSelectedSiteId] = useState(payload.candidateSites[0]?.id ?? "");
  const [rangeAnxiety, setRangeAnxiety] = useState(56);
  const [capexMultiplier, setCapexMultiplier] = useState(108);
  const [competitorPressure, setCompetitorPressure] = useState(44);
  const [nodeStates, setNodeStates] = useState<Record<string, NodeState>>(() =>
    Object.fromEntries(
      payload.candidateSites.map((site) => [site.id, site.npvM >= 0 ? "build" : "hold"]),
    ) as Record<string, NodeState>,
  );

  const derived = useMemo(() => {
    const anxiety = clamp(rangeAnxiety / 100, 0, 1);
    const capexFactor = clamp(capexMultiplier / 100, 0.8, 1.45);
    const competitor = clamp(competitorPressure / 100, 0, 1);

    const adjustedSites = payload.candidateSites.map((site) => {
      const state = nodeStates[site.id] ?? "hold";
      const stateFactor = state === "build" ? 1 : state === "hold" ? 0.58 : 0.22;

      const capture = clamp(
        site.capturesFordPct * (0.78 + anxiety * 0.58) * (1 - competitor * 0.26) * stateFactor,
        2,
        96,
      );
      const cannibalization = clamp(
        site.cannibalizesTeslaUnitsPerMonth * (1 + competitor * 0.42) * (state === "abandon" ? 0.45 : 1),
        0,
        40,
      );
      const adjustedCapexM = site.capexM * capexFactor * (state === "build" ? 1 : state === "hold" ? 0.68 : 0.18);
      const captureLiftM = (capture - site.capturesFordPct) * 0.06;
      const cannibalDragM = (cannibalization - site.cannibalizesTeslaUnitsPerMonth) * 0.14;
      const capexDragM = adjustedCapexM - site.capexM;
      const statePenalty = state === "abandon" ? -site.capexM * 0.26 : 0;
      const adjustedNpvM = site.npvM + captureLiftM - cannibalDragM - capexDragM + statePenalty;

      return {
        ...site,
        state,
        capture,
        cannibalization,
        adjustedCapexM,
        adjustedNpvM,
      };
    });

    const selectedSite = adjustedSites.find((site) => site.id === selectedSiteId) ?? adjustedSites[0]!;
    const ranked = [...adjustedSites].sort((a, b) => b.adjustedNpvM - a.adjustedNpvM);

    const flowMix = payload.flows.reduce<Record<string, number>>((acc, flow) => {
      acc[flow.brand] = (acc[flow.brand] ?? 0) + 1;
      return acc;
    }, {});
    const totalFlows = payload.flows.length;

    const sensitivity = Array.from({ length: 9 }, (_, idx) => 0.78 + idx * 0.08).map((capex) => {
      const adjustedCapex = selectedSite.capexM * capex;
      const npv = selectedSite.adjustedNpvM - (adjustedCapex - selectedSite.adjustedCapexM);
      const downside = npv - (0.32 + competitor * 0.2);
      const upside = npv + (0.28 + anxiety * 0.22);
      return { capex, npv, downside, upside };
    });

    const corridorNpv = adjustedSites.reduce((sum, site) => sum + site.adjustedNpvM, 0);
    const buildCount = adjustedSites.filter((site) => site.state === "build").length;
    const utilizationForecast = clamp(0.48 + buildCount / Math.max(1, adjustedSites.length) * 0.42 + anxiety * 0.14, 0.2, 0.98);
    const downsideSummary = adjustedSites.filter((site) => site.adjustedNpvM < 0).length;

    return {
      anxiety,
      capexFactor,
      competitor,
      adjustedSites,
      selectedSite,
      ranked,
      flowMix,
      totalFlows,
      sensitivity,
      corridorNpv,
      buildCount,
      utilizationForecast,
      downsideSummary,
    };
  }, [payload, selectedSiteId, rangeAnxiety, capexMultiplier, competitorPressure, nodeStates]);

  type Station = EvPayload["stations"][number];
  type Flow = EvPayload["flows"][number];
  type Candidate = (typeof derived.adjustedSites)[number];
  type MapObject = Station | Candidate;

  const layers: Layer[] = [
    new PathLayer<Flow>({
      id: "ev-flows",
      data: payload.flows,
      getPath: (flow) => flow.path,
      getColor: (flow) => flowColor(flow.brand),
      getWidth: 1.8 + derived.anxiety * 1.4,
      widthMinPixels: 1,
      pickable: false,
      opacity: 0.88,
    }),
    new ScatterplotLayer<Station>({
      id: "ev-stations",
      data: payload.stations,
      getPosition: (station) => [station.lon, station.lat],
      getRadius: 68,
      radiusMinPixels: 3,
      radiusMaxPixels: 10,
      getFillColor: (station) => stationColor(station.brand),
      getLineColor: new Uint8ClampedArray([226, 232, 240, 145]),
      lineWidthMinPixels: 1,
      stroked: true,
      pickable: true,
      opacity: 0.86,
    }),
    new ScatterplotLayer<Candidate>({
      id: "ev-cannibal-halo",
      data: derived.adjustedSites,
      getPosition: (site) => [site.lon, site.lat],
      getRadius: (site) => 180 + site.cannibalization * 8,
      radiusMinPixels: 8,
      radiusMaxPixels: 48,
      getFillColor: (site) =>
        site.state === "abandon"
          ? new Uint8ClampedArray([251, 113, 133, 52])
          : new Uint8ClampedArray([245, 158, 11, 46]),
      stroked: false,
      pickable: false,
    }),
    new ScatterplotLayer<Candidate>({
      id: "ev-candidates",
      data: derived.adjustedSites,
      getPosition: (site) => [site.lon, site.lat],
      getRadius: (site) => (site.id === derived.selectedSite.id ? 156 : 124),
      radiusMinPixels: 6,
      radiusMaxPixels: 16,
      getFillColor: (site) => {
        if (site.state === "abandon") return new Uint8ClampedArray([251, 113, 133, 214]);
        if (site.state === "build") return new Uint8ClampedArray([34, 211, 238, 214]);
        return new Uint8ClampedArray([139, 107, 62, 208]);
      },
      getLineColor: new Uint8ClampedArray([226, 232, 240, 180]),
      lineWidthMinPixels: 1,
      stroked: true,
      pickable: true,
      onClick: (info: PickingInfo) => {
        const obj = info.object as Candidate | null;
        if (obj?.id) setSelectedSiteId(obj.id);
      },
    }),
  ];

  const npvChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 56, right: 22, top: 22, bottom: 42 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: derived.adjustedSites.map((site) => site.name),
      axisLabel: { color: "#94a3b8", rotate: 20 },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "NPV ($M)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
    },
    series: [
      {
        name: "Adjusted NPV",
        type: "bar",
        data: derived.adjustedSites.map((site) => site.adjustedNpvM),
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { dataIndex?: unknown };
            const index = typeof raw.dataIndex === "number" ? raw.dataIndex : 0;
            const site = derived.adjustedSites[index];
            if (!site) return "rgba(182,169,151,0.8)";
            if (site.state === "abandon") return "rgba(157,49,49,0.86)";
            if (site.state === "build") return "rgba(73,95,69,0.92)";
            return "rgba(139,107,62,0.82)";
          },
        },
      },
    ],
  };

  const captureChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 56, right: 26, top: 20, bottom: 44 },
    tooltip: {
      formatter: (param: unknown) => {
        const raw = param as { data?: unknown };
        const data = (raw.data ?? {}) as {
          name?: string;
          capture?: number;
          cannibalization?: number;
          npv?: number;
          state?: NodeState;
        };
        return `${data.name ?? "Site"}<br/>State: ${data.state ?? "hold"}<br/>Capture: ${Math.round(data.capture ?? 0)}%<br/>Cannibalization: ${(data.cannibalization ?? 0).toFixed(1)} units/mo<br/>NPV: ${formatUSD((data.npv ?? 0) * 1_000_000)}`;
      },
    },
    xAxis: {
      type: "value",
      name: "Ford capture %",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Cannibalization (units/mo)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    series: [
      {
        type: "scatter",
        data: derived.adjustedSites.map((site) => ({
          name: site.name,
          capture: site.capture,
          cannibalization: site.cannibalization,
          npv: site.adjustedNpvM,
          state: site.state,
          value: [site.capture, site.cannibalization, site.adjustedNpvM],
        })),
        symbolSize: (value: unknown) => {
          const tuple = Array.isArray(value) ? value : [];
          const npv = typeof tuple[2] === "number" ? tuple[2] : 0;
          return 13 + clamp(npv + 3, 0, 12) * 1.6;
        },
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { data?: unknown };
            const data = (raw.data ?? {}) as { state?: NodeState; npv?: number };
            if (data.state === "abandon") return "rgba(157,49,49,0.88)";
            if (data.state === "build") return "rgba(73,95,69,0.86)";
            if ((data.npv ?? 0) >= 0) return "rgba(139,107,62,0.84)";
            return "rgba(157,49,49,0.82)";
          },
        },
      },
    ],
  };

  const sensitivityChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 54, right: 24, top: 20, bottom: 44 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: derived.sensitivity.map((point) => `${Math.round(point.capex * 100)}%`),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "NPV ($M)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
    },
    series: [
      {
        type: "line",
        name: "Downside",
        data: derived.sensitivity.map((point) => point.downside),
        smooth: 0.22,
        symbol: "none",
        lineStyle: { width: 1.4, color: "rgba(157,49,49,0.54)" },
      },
      {
        type: "line",
        name: "Upside",
        data: derived.sensitivity.map((point) => point.upside),
        smooth: 0.22,
        symbol: "none",
        lineStyle: { width: 1.4, color: "rgba(73,95,69,0.54)" },
        areaStyle: { color: "rgba(182,169,151,0.08)" },
      },
      {
        type: "line",
        name: "Base",
        data: derived.sensitivity.map((point) => point.npv),
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.6, color: "rgba(139,107,62,0.95)" },
        itemStyle: { color: "rgba(139,107,62,0.95)" },
      },
    ],
  };

  const annotations = payload.annotations ?? [];
  const chapterAAnnotations = pickChapterAnnotations(annotations, ["corridor", "site", "map"]);
  const chapterBAnnotations = pickChapterAnnotations(annotations, ["capture", "cannibalization", "surface", "sensitivity"]);
  const chapterCAnnotations = pickChapterAnnotations(annotations, ["npv", "recommendation", "decision"]);
  const chapterDAnnotations = pickChapterAnnotations(annotations, ["evidence", "recommendation"]);

  return (
    <div className="space-y-8">
      <RouteReveal profile="systems">
        <section className="neo-panel p-5">
          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">War-Game Controls</p>
              <p className="mt-2 text-sm text-slate-300">
                Tune range anxiety, capex inflation, and competitor pressure to
                recompute corridor economics in real time.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Slider
                label="Range anxiety index"
                value={rangeAnxiety}
                min={0}
                max={100}
                step={1}
                onChange={setRangeAnxiety}
                formatValue={(value) => `${value}%`}
              />
              <Slider
                label="CapEx multiplier"
                value={capexMultiplier}
                min={80}
                max={145}
                step={1}
                onChange={setCapexMultiplier}
                formatValue={(value) => `${value}%`}
              />
              <Slider
                label="Competitor pressure"
                value={competitorPressure}
                min={0}
                max={100}
                step={1}
                onChange={setCompetitorPressure}
                formatValue={(value) => `${value}%`}
              />
            </div>
          </div>
        </section>
      </RouteReveal>

      <RouteReveal profile="systems" delay={0.04}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Selected Site"
            value={derived.selectedSite.name}
            hint={payload.corridor.focus}
            accent="cyan"
          />
          <KpiCard
            label="Selected State"
            value={derived.selectedSite.state.toUpperCase()}
            hint={`Adj NPV ${formatUSD(derived.selectedSite.adjustedNpvM * 1_000_000)}`}
            accent={derived.selectedSite.state === "abandon" ? "crimson" : "amber"}
          />
          <KpiCard
            label="Corridor NPV"
            value={formatUSD(derived.corridorNpv * 1_000_000)}
            hint="Aggregate across node states"
            accent={derived.corridorNpv >= 0 ? "emerald" : "crimson"}
          />
          <KpiCard
            label="Utilization Forecast"
            value={`${formatNumber(derived.utilizationForecast * 100, { digits: 0 })}%`}
            hint="Build-state weighted"
            accent="amber"
          />
        </div>
      </RouteReveal>

      <RouteReveal profile="systems" delay={0.08}>
        <StoryChapterShell
          chapter="Primary Analysis"
          title="Corridor economics map"
          description="Map node states (build/hold/abandon), flow traces, and cannibalization halos with immediate economics feedback."
          insight={`${derived.selectedSite.name}: ${formatUSD(derived.selectedSite.adjustedNpvM * 1_000_000)} adjusted NPV (${derived.selectedSite.state}).`}
          impact="Node-state changes immediately alter capture, cannibalization, and aggregate corridor NPV."
          annotationCount={chapterAAnnotations.length}
          tone="cyan"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <DeckMap
              initialViewState={{
                longitude: -120.4,
                latitude: 36.5,
                zoom: 5.4,
                pitch: 42,
                bearing: -10,
              }}
              layers={layers}
              height={660}
              className="neo-panel"
              getTooltip={(info: PickingInfo) => {
                const obj = info.object as MapObject | null;
                if (!obj) return null;
                if ("pricePerKwh" in obj) {
                  return `${obj.brand} station\n$${obj.pricePerKwh.toFixed(2)}/kWh`;
                }
                if ("adjustedNpvM" in obj) {
                  return `${obj.name}\nState: ${obj.state}\nAdj. NPV: ${obj.adjustedNpvM.toFixed(1)}M\nCapture: ${obj.capture.toFixed(0)}%`;
                }
                return null;
              }}
            />
            <section className="terminal overflow-hidden" data-testid="decision-console">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Node State Controls</p>
              </div>
              <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
                <p><span className="text-slate-100">Selected node:</span> {derived.selectedSite.name}</p>
                <p><span className="text-slate-100">Capture / cannibalization:</span> {formatNumber(derived.selectedSite.capture, { digits: 0 })}% / {formatNumber(derived.selectedSite.cannibalization, { digits: 1 })} u/mo</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {(["build", "hold", "abandon"] as const).map((state) => (
                    <button
                      key={state}
                      type="button"
                      onClick={() =>
                        setNodeStates((prev) => ({
                          ...prev,
                          [derived.selectedSite.id]: state,
                        }))
                      }
                      className={
                        derived.selectedSite.state === state
                          ? "rounded-xl border border-amber-300/35 bg-amber-300/14 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-amber-100"
                          : "rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-300 hover:bg-white/[0.08]"
                      }
                    >
                      {state}
                    </button>
                  ))}
                </div>
                <p><span className="text-slate-100">Corridor NPV delta:</span> {formatUSD(derived.corridorNpv * 1_000_000)}</p>
              </div>
            </section>
          </div>
          <NarrativeStrip
            title="Corridor Notes"
            subtitle="Map-first analysis clarifies where capture gains are eroded by cannibalization halos."
            annotations={chapterAAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="systems" delay={0.12}>
        <StoryChapterShell
          chapter="Stress / Scenario"
          title="Capture-cannibalization surface and capex ladder"
          description="Surface view of node economics plus capex sensitivity ladder with explicit confidence stripe."
          insight={`Build-state nodes: ${formatNumber(derived.buildCount)} of ${formatNumber(derived.adjustedSites.length)}.`}
          impact="Sensitivity stripe exposes how quickly capex drift pushes marginal nodes into negative NPV."
          annotationCount={chapterBAnnotations.length}
          tone="amber"
        >
          <div className="grid gap-4 xl:grid-cols-2">
            <EChart option={captureChart} height={560} title="Capture vs Cannibalization Surface" className="neo-panel" />
            <EChart option={sensitivityChart} height={560} title="CapEx Sensitivity Ladder + Confidence Stripe" className="neo-panel" />
          </div>
          <NarrativeStrip
            title="Scenario Notes"
            subtitle="Surface and ladder jointly identify robust versus fragile build candidates."
            annotations={chapterBAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="systems" delay={0.16}>
        <StoryChapterShell
          chapter="Decision Console"
          title="Build-order recommendation"
          description="Rank deployment sequence and summarize downside risk at corridor scale."
          insight={`Top node ${derived.ranked[0]?.name ?? "n/a"} at ${derived.ranked[0] ? formatUSD(derived.ranked[0].adjustedNpvM * 1_000_000) : "—"}.`}
          impact={`Downside nodes ${formatNumber(derived.downsideSummary)} with utilization forecast ${formatNumber(derived.utilizationForecast * 100, { digits: 0 })}%.`}
          annotationCount={chapterCAnnotations.length}
          tone="emerald"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EChart option={npvChart} height={560} title="Adjusted Candidate NPV by Node State" className="neo-panel" />
            <DecisionConsole
              lines={[
                {
                  label: "Aggregate corridor NPV",
                  value: formatUSD(derived.corridorNpv * 1_000_000),
                  tone: derived.corridorNpv >= 0 ? "emerald" : "crimson",
                },
                {
                  label: "Build candidates",
                  value: `${formatNumber(derived.buildCount)} / ${formatNumber(derived.adjustedSites.length)}`,
                  tone: "amber",
                },
                {
                  label: "Utilization forecast",
                  value: `${formatNumber(derived.utilizationForecast * 100, { digits: 0 })}%`,
                  tone: "emerald",
                },
                {
                  label: "Downside case summary",
                  value: `${formatNumber(derived.downsideSummary)} nodes negative`,
                  tone: derived.downsideSummary > 0 ? "crimson" : "neutral",
                },
              ]}
            />
          </div>
          <NarrativeStrip
            title="Decision Notes"
            subtitle="Use ranked order plus downside count to phase deployment while limiting cannibalization drag."
            annotations={chapterCAnnotations}
            tone="emerald"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="systems" delay={0.2}>
        <StoryChapterShell
          chapter="Evidence"
          title="Recommendation evidence trace"
          description="Evidence packets and annotation trail for investment-committee style review."
          insight={`Evidence packets available: ${formatNumber(payload.decisionEvidence?.length ?? 0)}.`}
          impact="Creates a transparent trail from node-state assumptions to rollout recommendation."
          annotationCount={chapterDAnnotations.length}
          tone="cyan"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <NarrativeStrip
              title="Evidence Callouts"
              subtitle="Supporting annotations behind build/hold/abandon recommendations."
              annotations={chapterDAnnotations}
              tone="amber"
              maxItems={6}
            />
            <DecisionEvidencePanel title="Build Strategy Evidence" evidence={payload.decisionEvidence} />
          </div>
        </StoryChapterShell>
      </RouteReveal>
    </div>
  );
}
