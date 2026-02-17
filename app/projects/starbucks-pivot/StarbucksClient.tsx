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

export default function StarbucksClient({ payload }: { payload: StarbucksPayload }) {
  const [wfh, setWfh] = useState(58);
  const [officeShock, setOfficeShock] = useState(42);
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>("all");
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    payload.stores[0]?.id ?? "",
  );

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
      stores.find((store) => store.id === selectedStoreId) ?? visibleStores[0] ?? stores[0];

    const ranked = [...visibleStores]
      .sort((a, b) => (b.profitK - b.baselineProfitK) - (a.profitK - a.baselineProfitK))
      .slice(0, 6);

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
    };
  }, [payload, wfh, officeShock, segmentFilter, selectedStoreId]);

  type Store = (typeof derived.stores)[number];

  const layers: Layer[] = [
    new ScatterplotLayer<Store>({
      id: "starbucks-stores",
      data: derived.visibleStores,
      getPosition: (store) => [store.lon, store.lat],
      getRadius: (store) => 34 + Math.sqrt(store.traffic) * 2.5,
      radiusMinPixels: 3,
      radiusMaxPixels: 30,
      getFillColor: (store) => colorFor(store.recommendation),
      getLineColor: (store) =>
        store.id === derived.selectedStore?.id
          ? new Uint8ClampedArray([251, 191, 36, 230])
          : new Uint8ClampedArray([226, 232, 240, 150]),
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
    grid: { left: 44, right: 20, top: 18, bottom: 34 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: ["Convert", "Lockers", "Close"],
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
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

  const segmentChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 54, right: 26, top: 18, bottom: 38 },
    tooltip: { trigger: "axis" },
    legend: { top: 0, textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: derived.segmentStats.map((stat) => stat.segment),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: [
      {
        type: "value",
        name: "Traffic",
        axisLabel: { color: "#94a3b8" },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      },
      {
        type: "value",
        name: "Profit delta %",
        axisLabel: {
          color: "#94a3b8",
          formatter: (value: number) => `${value.toFixed(0)}%`,
        },
      },
    ],
    series: [
      {
        name: "Baseline traffic",
        type: "bar",
        data: derived.segmentStats.map((stat) => stat.baselineTraffic),
        itemStyle: { color: "rgba(148,163,184,0.56)" },
      },
      {
        name: "Scenario traffic",
        type: "bar",
        data: derived.segmentStats.map((stat) => stat.scenarioTraffic),
        itemStyle: { color: "rgba(34,211,238,0.78)" },
      },
      {
        name: "Profit delta %",
        type: "line",
        yAxisIndex: 1,
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 7,
        data: derived.segmentStats.map((stat) => {
          if (stat.baselineProfitK <= 0) return 0;
          return ((stat.scenarioProfitK - stat.baselineProfitK) / stat.baselineProfitK) * 100;
        }),
        lineStyle: { width: 2, color: "rgba(251,191,36,0.95)" },
        itemStyle: { color: "rgba(251,191,36,0.95)" },
      },
    ],
  };

  const storeScatter: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 56, right: 26, top: 18, bottom: 40 },
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
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Projected delta profit ($K)",
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
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
          return 10 + confidence * 18;
        },
      },
    ],
  };

  return (
    <div className="space-y-8">
      <section className="neo-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)] xl:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-emerald-100/90">
              Portfolio Surgeon Controls
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Adjust WFH and office-shock assumptions, then inspect recommendation
              shifts by segment.
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
          hint="Scenario vs baseline in visible set"
          accent={derived.totalDeltaProfitK >= 0 ? "emerald" : "crimson"}
        />
        <KpiCard
          label="Avg Traffic"
          value={formatNumber(derived.avgTraffic, { digits: 0 })}
          hint="Scenario-adjusted"
          accent="amber"
        />
      </div>

      <StoryChapterShell
        chapter="Chapter A"
        title="Geo demand surface"
        description="Map store-level pressure and recommendation confidence. Click any node for a surgery readout."
        tone="emerald"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <DeckMap
            initialViewState={{
              longitude: payload.city.center[0],
              latitude: payload.city.center[1],
              zoom: payload.city.zoom,
              pitch: 40,
              bearing: -12,
            }}
            layers={layers}
            height={440}
            className="neo-panel"
            getTooltip={(info: PickingInfo) => {
              const obj = info.object as Store | null;
              if (!obj) return null;
              return `${obj.name}\n${obj.recommendation}\nProjected delta: ${formatUSD(
                (obj.profitK - obj.baselineProfitK) * 1000,
              )}`;
            }}
          />
          <section className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-emerald-100/90">
                Store Surgery Output
              </p>
            </div>
            <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
              <p>
                <span className="text-slate-100">Store:</span>{" "}
                {derived.selectedStore?.name ?? "—"}
              </p>
              <p>
                <span className="text-slate-100">Recommendation:</span>{" "}
                {derived.selectedStore?.recommendation ?? "—"}
              </p>
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
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter B"
        title="Recommendation mix and segment stress"
        description="See how scenario stress redistributes surgery actions and traffic/profit by neighborhood segment."
        tone="cyan"
      >
        <div className="grid gap-4 xl:grid-cols-2">
          <EChart option={recChart} height={260} title="Recommendation Mix" className="neo-panel" />
          <EChart option={segmentChart} height={300} title="Segment Traffic and Profit Shift" className="neo-panel" />
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter C"
        title="Exposure vs opportunity matrix"
        description="Prioritize stores with high WFH exposure and strong positive delta under conversion or locker strategies."
        tone="amber"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <EChart option={storeScatter} height={330} title="Store Opportunity Matrix" className="neo-panel" />
          <section className="glass rounded-2xl p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">
              Top Surgery Targets
            </p>
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
    </div>
  );
}
