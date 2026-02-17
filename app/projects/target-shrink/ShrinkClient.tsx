"use client";

import { useMemo, useState } from "react";
import type { EChartsOption } from "echarts";
import { EChart } from "@/components/viz/EChart";
import { KpiCard } from "@/components/ui/KpiCard";
import { Slider } from "@/components/ui/Slider";
import { StoryChapterShell } from "@/components/story/StoryChapterShell";
import { clamp, lerp } from "@/lib/metrics/math";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

function interp(
  left: { threshold: number; preventedLoss: number; falsePositiveRate: number; roi: number },
  right: { threshold: number; preventedLoss: number; falsePositiveRate: number; roi: number },
  alpha: number,
) {
  return {
    threshold: lerp(left.threshold, right.threshold, alpha),
    preventedLoss: lerp(left.preventedLoss, right.preventedLoss, alpha),
    falsePositiveRate: lerp(left.falsePositiveRate, right.falsePositiveRate, alpha),
    roi: lerp(left.roi, right.roi, alpha),
  };
}

const EVENT_COLORS: Record<ShrinkPayload["events"][number]["type"], string> = {
  scan: "rgba(52,211,153,0.95)",
  sweep: "rgba(251,191,36,0.95)",
  switch: "rgba(251,113,133,0.95)",
};

export default function ShrinkClient({ payload }: { payload: ShrinkPayload }) {
  const [threshold, setThreshold] = useState(0.85);
  const [falsePositiveMultiplier, setFalsePositiveMultiplier] = useState(100);
  const [selectedZone, setSelectedZone] = useState<string>(
    payload.store.zones[0]?.id ?? "",
  );

  const derived = useMemo(() => {
    const outcomes = [...payload.policy.outcomes].sort(
      (a, b) => a.threshold - b.threshold,
    );

    const target = clamp(
      threshold,
      outcomes[0]?.threshold ?? threshold,
      outcomes.at(-1)?.threshold ?? threshold,
    );

    let left = outcomes[0]!;
    let right = outcomes.at(-1)!;
    for (let index = 0; index < outcomes.length - 1; index += 1) {
      const a = outcomes[index]!;
      const b = outcomes[index + 1]!;
      if (target >= a.threshold && target <= b.threshold) {
        left = a;
        right = b;
        break;
      }
    }

    const alpha =
      right.threshold === left.threshold
        ? 0
        : (target - left.threshold) / (right.threshold - left.threshold);
    const point = interp(left, right, alpha);

    const fpMultiplier = clamp(falsePositiveMultiplier / 100, 0.4, 2.2);
    const adjustedFalsePositiveCost = payload.economics.falsePositiveCost * fpMultiplier;
    const eventVolume = payload.events.length;
    const expectedFalsePositiveCost =
      point.falsePositiveRate * eventVolume * adjustedFalsePositiveCost;
    const expectedNetValue = point.preventedLoss - expectedFalsePositiveCost;

    const objectiveCurve = outcomes.map((outcome) => ({
      ...outcome,
      expectedNetValue:
        outcome.preventedLoss -
        outcome.falsePositiveRate * eventVolume * adjustedFalsePositiveCost,
    }));
    const recommended =
      objectiveCurve.reduce((best, value) =>
        value.expectedNetValue > best.expectedNetValue ? value : best,
      ) ?? objectiveCurve[0];

    const eventCountsByZone = payload.store.zones.reduce<Record<string, number>>(
      (acc, zone) => {
        acc[zone.id] = 0;
        return acc;
      },
      {},
    );
    for (const event of payload.events) {
      eventCountsByZone[event.zoneId] = (eventCountsByZone[event.zoneId] ?? 0) + 1;
    }

    const zone = payload.store.zones.find((item) => item.id === selectedZone) ?? payload.store.zones[0]!;
    const zoneEvents = payload.events.filter((event) => event.zoneId === zone.id);
    const zoneTriggered = zoneEvents.filter((event) => event.pTheft >= target);
    const zoneMix = zoneEvents.reduce<Record<string, number>>((acc, event) => {
      acc[event.type] = (acc[event.type] ?? 0) + 1;
      return acc;
    }, {});

    return {
      outcomes,
      point,
      fpMultiplier,
      adjustedFalsePositiveCost,
      expectedFalsePositiveCost,
      expectedNetValue,
      objectiveCurve,
      recommended,
      eventCountsByZone,
      zone,
      zoneEvents,
      zoneTriggered,
      zoneMix,
      eventVolume,
    };
  }, [payload, threshold, falsePositiveMultiplier, selectedZone]);

  const roiChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 52, top: 18, bottom: 36 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: derived.objectiveCurve.map((outcome) =>
        `${Math.round(outcome.threshold * 100)}%`,
      ),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    yAxis: [
      {
        type: "value",
        name: "ROI",
        axisLabel: {
          color: "#94a3b8",
          formatter: (value: number) => `${Math.round(value * 100)}%`,
        },
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      },
      {
        type: "value",
        name: "Net value ($K)",
        axisLabel: {
          color: "#94a3b8",
          formatter: (value: number) => `${Math.round(value / 1000)}`,
        },
      },
    ],
    series: [
      {
        name: "ROI",
        type: "line",
        data: derived.objectiveCurve.map((outcome) => outcome.roi),
        smooth: 0.2,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2.4, color: "rgba(52,211,153,0.95)" },
      },
      {
        name: "Expected net value",
        type: "line",
        yAxisIndex: 1,
        data: derived.objectiveCurve.map((outcome) => outcome.expectedNetValue),
        smooth: 0.2,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { width: 2.4, color: "rgba(251,191,36,0.95)" },
        areaStyle: { color: "rgba(251,191,36,0.1)" },
      },
    ],
  };

  const timelineChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 24, top: 18, bottom: 34 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "value",
      name: "Time (s)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(148,163,184,0.1)" } },
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
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
    },
    series: [
      {
        name: "P(theft)",
        type: "line",
        smooth: 0.2,
        symbol: "circle",
        symbolSize: 4,
        data: derived.zoneEvents.map((event) => [event.t, event.pTheft]),
        lineStyle: { width: 2, color: "rgba(34,211,238,0.95)" },
        itemStyle: { color: "rgba(34,211,238,0.95)" },
      },
      {
        name: "Threshold",
        type: "line",
        symbol: "none",
        data: derived.zoneEvents.map((event) => [event.t, threshold]),
        lineStyle: { width: 2, type: "dashed", color: "rgba(251,191,36,0.95)" },
      },
      {
        name: "Triggered",
        type: "scatter",
        symbolSize: 10,
        data: derived.zoneTriggered.map((event) => [event.t, event.pTheft, event.type]),
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { data?: unknown };
            const array = Array.isArray(raw.data) ? raw.data : [];
            const type = array[2];
            if (type === "scan") return EVENT_COLORS.scan;
            if (type === "sweep") return EVENT_COLORS.sweep;
            if (type === "switch") return EVENT_COLORS.switch;
            return "rgba(251,113,133,0.95)";
          },
        },
      },
    ],
  };

  const zonePressureChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 24, top: 18, bottom: 36 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: payload.store.zones.map((zone) => zone.name),
      axisLabel: { color: "#94a3b8" },
      axisLine: { lineStyle: { color: "rgba(148,163,184,0.25)" } },
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
        splitLine: { lineStyle: { color: "rgba(148,163,184,0.12)" } },
      },
      {
        type: "value",
        axisLabel: { color: "#94a3b8" },
      },
    ],
    series: [
      {
        name: "Theft pressure",
        type: "bar",
        data: payload.store.zones.map((zone) => zone.theftPressure),
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { dataIndex?: unknown };
            const index = typeof raw.dataIndex === "number" ? raw.dataIndex : 0;
            const zone = payload.store.zones[index];
            const isSelected = zone?.id === derived.zone.id;
            return isSelected ? "rgba(251,113,133,0.92)" : "rgba(251,113,133,0.68)";
          },
        },
      },
      {
        name: "Observed events",
        type: "line",
        yAxisIndex: 1,
        smooth: 0.2,
        symbol: "circle",
        symbolSize: 7,
        data: payload.store.zones.map(
          (zone) => derived.eventCountsByZone[zone.id] ?? 0,
        ),
        lineStyle: { width: 2, color: "rgba(34,211,238,0.95)" },
        itemStyle: { color: "rgba(34,211,238,0.95)" },
      },
    ],
  };

  const zoneMixChart: EChartsOption = {
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
        data: (["scan", "sweep", "switch"] as const).map((type) => ({
          name: type,
          value: derived.zoneMix[type] ?? 0,
          itemStyle: { color: EVENT_COLORS[type] },
        })),
        label: { color: "#e2e8f0" },
      },
    ],
  };

  const store = payload.store;
  const scale = 0.6;
  const width = Math.round(store.width * scale);
  const height = Math.round(store.height * scale);

  function zoneFill(pressure: number, active: boolean) {
    const clamped = clamp(pressure, 0, 1);
    const r = Math.round(60 + clamped * 160);
    const g = Math.round(95 + clamped * 12);
    const b = Math.round(145 - clamped * 72);
    return active ? `rgba(${r},${g},${b},0.58)` : `rgba(${r},${g},${b},0.33)`;
  }

  return (
    <div className="space-y-8">
      <section className="neo-panel p-5">
        <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-end">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">
              Ops Controls
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Tune policy threshold and customer-friction cost multiplier to see
              where expected value peaks.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Slider
              label="Detain threshold P(theft)"
              value={threshold}
              min={derived.outcomes[0]?.threshold ?? 0.55}
              max={derived.outcomes.at(-1)?.threshold ?? 0.95}
              step={0.01}
              onChange={setThreshold}
              formatValue={(value) => formatPct(value, { digits: 0 })}
            />
            <Slider
              label="False-positive cost multiplier"
              value={falsePositiveMultiplier}
              min={50}
              max={180}
              step={1}
              onChange={setFalsePositiveMultiplier}
              formatValue={(value) => `${value}%`}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Current Threshold"
          value={formatPct(derived.point.threshold, { digits: 0 })}
          hint="Active stop-rule setting"
          accent="amber"
        />
        <KpiCard
          label="Expected Net Value"
          value={formatUSD(derived.expectedNetValue)}
          hint="Prevented loss minus expected false-positive drag"
          accent={derived.expectedNetValue >= 0 ? "emerald" : "crimson"}
        />
        <KpiCard
          label="Expected FP Cost"
          value={formatUSD(derived.expectedFalsePositiveCost)}
          hint={`Cost multiplier ${formatNumber(derived.fpMultiplier, { digits: 2 })}x`}
          accent="crimson"
        />
        <KpiCard
          label="Recommended Threshold"
          value={formatPct(derived.recommended.threshold, { digits: 0 })}
          hint="Argmax expected net value"
          accent="emerald"
        />
      </div>

      <StoryChapterShell
        chapter="Chapter A"
        title="Policy frontier"
        description="Optimize for expected value, not classifier vanity metrics. Threshold should maximize net economics."
        tone="amber"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
          <EChart option={roiChart} height={340} title="ROI + Net Value Frontier" className="neo-panel" />
          <section className="terminal overflow-hidden">
            <div className="border-b border-white/10 bg-white/5 px-5 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">
                Threshold Decision Memo
              </p>
            </div>
            <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
              <p>
                <span className="text-slate-100">Current:</span>{" "}
                {formatPct(derived.point.threshold, { digits: 0 })}
              </p>
              <p>
                <span className="text-slate-100">Recommended:</span>{" "}
                {formatPct(derived.recommended.threshold, { digits: 0 })}
              </p>
              <p>
                <span className="text-slate-100">ROI at current:</span>{" "}
                {formatPct(derived.point.roi, { digits: 0 })}
              </p>
              <p>
                <span className="text-slate-100">Event volume:</span>{" "}
                {formatNumber(derived.eventVolume)}
              </p>
            </div>
          </section>
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter B"
        title="Store pressure map"
        description="Select a zone on the floorplan to inspect event composition and threshold-trigger behavior in context."
        tone="amber"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="neo-panel overflow-hidden p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">
              Zone Command Map
            </p>
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="mt-3 h-auto w-full"
            >
              <rect
                x={0}
                y={0}
                width={width}
                height={height}
                rx={16}
                fill="rgba(255,255,255,0.02)"
                stroke="rgba(148,163,184,0.18)"
              />
              {store.zones.map((zone) => {
                const x = Math.round(zone.x * scale);
                const y = Math.round(zone.y * scale);
                const w = Math.round(zone.w * scale);
                const h = Math.round(zone.h * scale);
                const active = zone.id === derived.zone.id;
                const count = derived.eventCountsByZone[zone.id] ?? 0;
                return (
                  <g key={zone.id}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height={h}
                      rx={12}
                      fill={zoneFill(zone.theftPressure, active)}
                      stroke={active ? "rgba(251,191,36,0.85)" : "rgba(255,255,255,0.1)"}
                      strokeWidth={active ? 2 : 1}
                      onClick={() => setSelectedZone(zone.id)}
                    />
                    <text x={x + 12} y={y + 20} fill="rgba(226,232,240,0.9)" fontSize="12">
                      {zone.name}
                    </text>
                    <text x={x + 12} y={y + 40} fill="rgba(148,163,184,0.9)" fontSize="11">
                      events: {formatNumber(count)}
                    </text>
                  </g>
                );
              })}

              {payload.initialCameras.map((camera) => (
                <circle
                  key={camera.id}
                  cx={Math.round(camera.x * scale)}
                  cy={Math.round(camera.y * scale)}
                  r={7}
                  fill="rgba(34,211,238,0.85)"
                  stroke="rgba(226,232,240,0.8)"
                  strokeWidth={1}
                />
              ))}
            </svg>
          </section>
          <EChart option={zonePressureChart} height={360} title="Zone Pressure and Event Density" className="neo-panel" />
        </div>
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter C"
        title="Event stream and trigger logic"
        description="Inspect how the selected zone's event sequence crosses policy thresholds and drives intervention volume."
        tone="cyan"
      >
        <EChart option={timelineChart} height={320} title={`Event Stream · ${derived.zone.name}`} className="neo-panel" />
      </StoryChapterShell>

      <StoryChapterShell
        chapter="Chapter D"
        title="Zone behavior profile"
        description="Break down scan/sweep/switch mix to tune camera placement, staffing, and intervention scripts."
        tone="crimson"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <EChart option={zoneMixChart} height={320} title={`Incident Mix · ${derived.zone.name}`} className="neo-panel" />
          <section className="glass rounded-2xl p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-rose-100/90">
              Zone Command Output
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-100">Zone:</span> {derived.zone.name}
              </p>
              <p>
                <span className="text-slate-100">Pressure:</span>{" "}
                {formatPct(derived.zone.theftPressure, { digits: 0 })}
              </p>
              <p>
                <span className="text-slate-100">Triggered events:</span>{" "}
                {formatNumber(derived.zoneTriggered.length)}
              </p>
              <p>
                <span className="text-slate-100">Suggested action:</span>{" "}
                {derived.zoneTriggered.length > 4
                  ? "High-frequency intervention posture"
                  : "Monitor with selective interventions"}
              </p>
            </div>
          </section>
        </div>
      </StoryChapterShell>
    </div>
  );
}
