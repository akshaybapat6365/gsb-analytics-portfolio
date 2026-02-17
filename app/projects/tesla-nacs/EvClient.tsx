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

function stationColor(brand: "Tesla" | "EA" | "Other") {
  return STATION_COLORS[brand];
}

function flowColor(brand: "Tesla" | "Ford" | "GM" | "Other") {
  return FLOW_COLORS[brand];
}

export default function EvClient({ payload }: { payload: EvPayload }) {
  const [selectedSiteId, setSelectedSiteId] = useState(
    payload.candidateSites[0]?.id ?? "",
  );
  const [rangeAnxiety, setRangeAnxiety] = useState(56);
  const [capexMultiplier, setCapexMultiplier] = useState(108);
  const [competitorPressure, setCompetitorPressure] = useState(44);

  const derived = useMemo(() => {
    const anxiety = clamp(rangeAnxiety / 100, 0, 1);
    const capexFactor = clamp(capexMultiplier / 100, 0.8, 1.45);
    const competitor = clamp(competitorPressure / 100, 0, 1);

    const adjustedSites = payload.candidateSites.map((site) => {
      const capture = clamp(
        site.capturesFordPct * (0.78 + anxiety * 0.58) * (1 - competitor * 0.26),
        4,
        96,
      );
      const cannibalization = clamp(
        site.cannibalizesTeslaUnitsPerMonth * (1 + competitor * 0.42),
        0,
        40,
      );
      const adjustedCapexM = site.capexM * capexFactor;
      const captureLiftM = (capture - site.capturesFordPct) * 0.06;
      const cannibalDragM = (cannibalization - site.cannibalizesTeslaUnitsPerMonth) * 0.14;
      const capexDragM = adjustedCapexM - site.capexM;
      const adjustedNpvM = site.npvM + captureLiftM - cannibalDragM - capexDragM;

      return {
        ...site,
        capture,
        cannibalization,
        adjustedCapexM,
        adjustedNpvM,
      };
    });

    const selectedSite =
      adjustedSites.find((site) => site.id === selectedSiteId) ?? adjustedSites[0]!;
    const ranked = [...adjustedSites].sort((a, b) => b.adjustedNpvM - a.adjustedNpvM);

    const flowMix = payload.flows.reduce<Record<string, number>>((acc, flow) => {
      acc[flow.brand] = (acc[flow.brand] ?? 0) + 1;
      return acc;
    }, {});
    const totalFlows = payload.flows.length;

    const sensitivity = Array.from({ length: 8 }, (_, idx) => 0.82 + idx * 0.08).map(
      (capex) => {
        const adjustedCapex = selectedSite.capexM * capex;
        const npv =
          selectedSite.adjustedNpvM - (adjustedCapex - selectedSite.adjustedCapexM);
        return { capex, npv };
      },
    );

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
    };
  }, [payload, selectedSiteId, rangeAnxiety, capexMultiplier, competitorPressure]);

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
      opacity: 0.9,
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
      id: "ev-candidates",
      data: derived.adjustedSites,
      getPosition: (site) => [site.lon, site.lat],
      getRadius: (site) => (site.id === derived.selectedSite.id ? 148 : 116),
      radiusMinPixels: 5,
      radiusMaxPixels: 15,
      getFillColor: (site) => {
        if (site.id === derived.selectedSite.id) {
          return new Uint8ClampedArray([52, 211, 153, 228]);
        }
        return site.adjustedNpvM >= 0
          ? new Uint8ClampedArray([34, 211, 238, 208])
          : new Uint8ClampedArray([251, 113, 133, 214]);
      },
      getLineColor: new Uint8ClampedArray([226, 232, 240, 180]),
      lineWidthMinPixels: 1,
      stroked: true,
      pickable: true,
      onClick: (info: PickingInfo) => {
        const obj = info.object as Candidate | null;
        if (obj?.id) {
          setSelectedSiteId(obj.id);
        }
      },
    }),
  ];

  const npvChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 54, right: 20, top: 18, bottom: 34 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: derived.adjustedSites.map((site) => site.name),
      axisLabel: { color: "#94a3b8", rotate: 20 },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "NPV ($M)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
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
            if (!site) return "rgba(148,163,184,0.8)";
            if (site.id === derived.selectedSite.id) return "rgba(52,211,153,0.92)";
            return site.adjustedNpvM >= 0
              ? "rgba(34,211,238,0.78)"
              : "rgba(251,113,133,0.82)";
          },
        },
      },
    ],
  };

  const captureChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 56, right: 26, top: 18, bottom: 40 },
    tooltip: {
      formatter: (param: unknown) => {
        const raw = param as { data?: unknown };
        const data = (raw.data ?? {}) as {
          name?: string;
          capture?: number;
          cannibalization?: number;
          npv?: number;
        };
        return `${data.name ?? "Site"}<br/>Capture: ${Math.round(data.capture ?? 0)}%<br/>Cannibalization: ${(data.cannibalization ?? 0).toFixed(1)} units/mo<br/>NPV: ${formatUSD((data.npv ?? 0) * 1_000_000)}`;
      },
    },
    xAxis: {
      type: "value",
      name: "Ford capture %",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Cannibalization (units/mo)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    series: [
      {
        type: "scatter",
        data: derived.adjustedSites.map((site) => ({
          name: site.name,
          capture: site.capture,
          cannibalization: site.cannibalization,
          npv: site.adjustedNpvM,
          value: [site.capture, site.cannibalization, site.adjustedNpvM],
        })),
        symbolSize: (value: unknown) => {
          const tuple = Array.isArray(value) ? value : [];
          const npv = typeof tuple[2] === "number" ? tuple[2] : 0;
          return 12 + clamp(npv + 3, 0, 12) * 1.4;
        },
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { data?: unknown };
            const data = (raw.data ?? {}) as { npv?: number };
            return (data.npv ?? 0) >= 0
              ? "rgba(52,211,153,0.84)"
              : "rgba(251,113,133,0.86)";
          },
        },
      },
    ],
  };

  const flowMixChart: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: { trigger: "item" },
    legend: {
      bottom: 0,
      textStyle: { color: "#cbd5e1" },
    },
    series: [
      {
        type: "pie",
        radius: ["42%", "70%"],
        data: (["Tesla", "Ford", "GM", "Other"] as const).map((brand) => ({
          name: brand,
          value: derived.flowMix[brand] ?? 0,
          itemStyle: {
            color: `rgba(${flowColor(brand)[0]},${flowColor(brand)[1]},${flowColor(brand)[2]},0.9)`,
          },
        })),
        label: { color: "#e2e8f0" },
      },
    ],
  };

  const sensitivityChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 24, top: 18, bottom: 38 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: derived.sensitivity.map((point) => `${Math.round(point.capex * 100)}%`),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "NPV ($M)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
    },
    series: [
      {
        type: "line",
        data: derived.sensitivity.map((point) => point.npv),
        smooth: 0.2,
        symbol: "circle",
        symbolSize: 7,
        lineStyle: { width: 2.4, color: "rgba(251,191,36,0.95)" },
        itemStyle: { color: "rgba(251,191,36,0.95)" },
        areaStyle: { color: "rgba(251,191,36,0.1)" },
      },
    ],
  };

  return (
    <div className="space-y-8">
      <section className="neo-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-100/90">
              War-Game Controls
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Tune range anxiety, capex inflation, and competitor pressure to
              recompute corridor economics.
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Selected Site"
          value={derived.selectedSite.name}
          hint={payload.corridor.focus}
          accent="cyan"
        />
        <KpiCard
          label="Adjusted NPV"
          value={formatUSD(derived.selectedSite.adjustedNpvM * 1_000_000)}
          hint={`CapEx ${formatUSD(derived.selectedSite.adjustedCapexM * 1_000_000)}`}
          accent={derived.selectedSite.adjustedNpvM >= 0 ? "emerald" : "crimson"}
        />
        <KpiCard
          label="Capture / Cannibalization"
          value={`${formatNumber(derived.selectedSite.capture, { digits: 0 })}% / ${formatNumber(derived.selectedSite.cannibalization, { digits: 1 })}`}
          hint="Ford capture vs Tesla cannibalization"
          accent="amber"
        />
        <KpiCard
          label="Flow Inventory"
          value={formatNumber(derived.totalFlows)}
          hint="Brand flow paths on corridor"
          accent="cyan"
        />
      </div>

      <StoryChapterShell
        chapter="Chapter A"
        title="Corridor war map"
        description="Click candidate nodes to simulate build decisions and observe map-level strategic consequences."
        tone="cyan"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <DeckMap
            initialViewState={{
              longitude: -120.4,
              latitude: 36.5,
              zoom: 5.4,
              pitch: 42,
              bearing: -10,
            }}
            layers={layers}
            height={520}
            className="neo-panel"
            getTooltip={(info: PickingInfo) => {
              const obj = info.object as MapObject | null;
              if (!obj) return null;
              if ("pricePerKwh" in obj) {
                return `${obj.brand} station\n$${obj.pricePerKwh.toFixed(2)}/kWh`;
              }
              if ("adjustedNpvM" in obj) {
                return `${obj.name}\nAdj. NPV: ${obj.adjustedNpvM.toFixed(1)}M\nCapture: ${obj.capture.toFixed(0)}%`;
              }
              return null;
            }}
          />
          <section className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100/90">
                Build Recommendation
              </p>
            </div>
            <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
              <p>
                <span className="text-slate-100">Node:</span> {derived.selectedSite.name}
              </p>
              <p>
                <span className="text-slate-100">Adjusted NPV:</span>{" "}
                {formatUSD(derived.selectedSite.adjustedNpvM * 1_000_000)}
              </p>
              <p>
                <span className="text-slate-100">Decision:</span>{" "}
                {derived.selectedSite.adjustedNpvM >= 0 ? "Build / Expand" : "Defer / Avoid"}
              </p>
              <p>
                <span className="text-slate-100">Strategic note:</span>{" "}
                {derived.selectedSite.adjustedNpvM >= 0
                  ? "Capture dominates cannibalization under current assumptions."
                  : "CapEx + cannibalization dominates capture gains."}
              </p>
            </div>
          </section>
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter B"
        title="NPV and trade-off surface"
        description="Compare candidate economics under current assumptions and inspect capture/cannibalization geometry."
        tone="emerald"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <EChart option={npvChart} height={320} title="Adjusted Candidate NPV" className="neo-panel" />
          <EChart option={captureChart} height={320} title="Capture vs Cannibalization Matrix" className="neo-panel" />
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter C"
        title="Flow mix and sensitivity"
        description="Quantify brand traffic opportunity and stress test selected node economics against CapEx drift."
        tone="amber"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <EChart option={flowMixChart} height={320} title="Brand Flow Mix" className="neo-panel" />
          <EChart option={sensitivityChart} height={320} title="Selected Node CapEx Sensitivity" className="neo-panel" />
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter D"
        title="Priority queue"
        description="Rank rollout sequence by adjusted NPV and strategic optionality."
        tone="cyan"
      >
        <section className="glass rounded-2xl p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-100/90">
            Rollout Ranking
          </p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            {derived.ranked.map((site, index) => (
              <div key={site.id} className="flex items-center justify-between gap-3">
                <p>
                  <span className="text-slate-500">{index + 1}.</span> {site.name}
                </p>
                <span className={site.adjustedNpvM >= 0 ? "font-mono text-emerald-100" : "font-mono text-rose-100"}>
                  {formatUSD(site.adjustedNpvM * 1_000_000)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </StoryChapterShell>
    </div>
  );
}
