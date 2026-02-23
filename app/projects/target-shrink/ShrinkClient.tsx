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
import { clamp, lerp } from "@/lib/metrics/math";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

const EVENT_COLORS: Record<ShrinkPayload["events"][number]["type"], string> = {
  scan: "rgba(73,95,69,0.95)",
  sweep: "rgba(139,107,62,0.95)",
  switch: "rgba(157,49,49,0.95)",
};

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

function pickChapterAnnotations(
  annotations: NonNullable<ShrinkPayload["annotations"]>,
  keywords: string[],
) {
  const pool = annotations.filter((annotation) =>
    keywords.some((keyword) => annotation.moduleId.includes(keyword)),
  );
  return pool.length > 0 ? pool : annotations;
}

export default function ShrinkClient({ payload }: { payload: ShrinkPayload }) {
  const [threshold, setThreshold] = useState(0.85);
  const [falsePositiveMultiplier, setFalsePositiveMultiplier] = useState(100);
  const [selectedZone, setSelectedZone] = useState<string>(payload.store.zones[0]?.id ?? "");
  const [eventCursor, setEventCursor] = useState(0);

  const derived = useMemo(() => {
    const outcomes = [...payload.policy.outcomes].sort((a, b) => a.threshold - b.threshold);

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

    const objectiveCurve = outcomes.map((outcome) => {
      const falsePositiveCost =
        outcome.falsePositiveRate * eventVolume * adjustedFalsePositiveCost;
      const recoveredNet = outcome.preventedLoss - falsePositiveCost;
      return {
        ...outcome,
        falsePositiveCost,
        recoveredNet,
      };
    });

    const expectedFalsePositiveCost =
      point.falsePositiveRate * eventVolume * adjustedFalsePositiveCost;
    const expectedNetValue = point.preventedLoss - expectedFalsePositiveCost;

    const recommended =
      objectiveCurve.reduce((best, value) =>
        value.recoveredNet > best.recoveredNet ? value : best,
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

    const cursor = clamp(eventCursor, 0, Math.max(0, zoneEvents.length - 1));
    const selectedEvent = zoneEvents[cursor] ?? null;

    const monthlyRecovered = point.preventedLoss * 4;
    const monthlyFalsePositive = expectedFalsePositiveCost * 4;
    const monthlyNet = monthlyRecovered - monthlyFalsePositive;

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
      selectedEvent,
      cursor,
      monthlyRecovered,
      monthlyFalsePositive,
      monthlyNet,
    };
  }, [payload, threshold, falsePositiveMultiplier, selectedZone, eventCursor]);

  const frontierChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 62, right: 38, top: 20, bottom: 44 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "value",
      name: "False-positive cost ($)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.1)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      name: "Recovered net ($)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    series: [
      {
        name: "Frontier",
        type: "line",
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 7,
        data: derived.objectiveCurve.map((outcome) => [outcome.falsePositiveCost, outcome.recoveredNet]),
        lineStyle: { width: 2.6, color: "rgba(139,107,62,0.95)" },
        itemStyle: { color: "rgba(139,107,62,0.95)" },
      },
      {
        name: "Recommended point",
        type: "scatter",
        symbolSize: 18,
        data: [[derived.recommended.falsePositiveCost, derived.recommended.recoveredNet]],
        itemStyle: { color: "rgba(73,95,69,0.95)" },
      },
      {
        name: "Current point",
        type: "scatter",
        symbolSize: 15,
        data: [[derived.expectedFalsePositiveCost, derived.expectedNetValue]],
        itemStyle: { color: "rgba(157,49,49,0.92)" },
      },
    ],
  };

  const zonePressureChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 52, right: 24, top: 22, bottom: 40 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "category",
      data: payload.store.zones.map((zone) => zone.name),
      axisLabel: { color: "#94a3b8" },
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
            return isSelected ? "rgba(157,49,49,0.92)" : "rgba(157,49,49,0.68)";
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
        data: payload.store.zones.map((zone) => derived.eventCountsByZone[zone.id] ?? 0),
        lineStyle: { width: 2, color: "rgba(139,107,62,0.95)" },
        itemStyle: { color: "rgba(139,107,62,0.95)" },
      },
    ],
  };

  const timelineChart: EChartsOption = {
    backgroundColor: "transparent",
    grid: { left: 54, right: 26, top: 24, bottom: 44 },
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: "#cbd5e1" } },
    xAxis: {
      type: "value",
      name: "Time (s)",
      nameTextStyle: { color: "#94a3b8" },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.1)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    yAxis: {
      type: "value",
      min: 0,
      max: 1,
      axisLabel: {
        color: "#94a3b8",
        formatter: (value: number) => `${Math.round(value * 100)}%`,
      },
      splitLine: { lineStyle: { color: "rgba(182,169,151,0.12)" } },
      axisLine: { lineStyle: { color: "rgba(182,169,151,0.25)" } },
    },
    series: [
      {
        name: "P(theft)",
        type: "line",
        smooth: 0.22,
        symbol: "circle",
        symbolSize: 4,
        data: derived.zoneEvents.map((event) => [event.t, event.pTheft]),
        lineStyle: { width: 2.2, color: "rgba(139,107,62,0.95)" },
      },
      {
        name: "Threshold",
        type: "line",
        symbol: "none",
        data: derived.zoneEvents.map((event) => [event.t, threshold]),
        lineStyle: { width: 2, type: "dashed", color: "rgba(73,95,69,0.9)" },
      },
      {
        name: "Incident stream",
        type: "scatter",
        symbolSize: 10,
        data: derived.zoneEvents.map((event) => [event.t, event.pTheft, event.type]),
        itemStyle: {
          color: (param: unknown) => {
            const raw = param as { data?: unknown };
            const tuple = Array.isArray(raw.data) ? raw.data : [];
            const eventType = tuple[2];
            if (eventType === "scan") return EVENT_COLORS.scan;
            if (eventType === "sweep") return EVENT_COLORS.sweep;
            if (eventType === "switch") return EVENT_COLORS.switch;
            return "rgba(157,49,49,0.95)";
          },
        },
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
  const scale = 0.64;
  const width = Math.round(store.width * scale);
  const height = Math.round(store.height * scale);

  function zoneFill(pressure: number, active: boolean) {
    const clamped = clamp(pressure, 0, 1);
    const r = Math.round(68 + clamped * 142);
    const g = Math.round(94 + clamped * 12);
    const b = Math.round(76 + clamped * 34);
    return active ? `rgba(${r},${g},${b},0.58)` : `rgba(${r},${g},${b},0.32)`;
  }

  const annotations = payload.annotations ?? [];
  const chapterAAnnotations = pickChapterAnnotations(annotations, ["zone", "map", "pressure"]);
  const chapterBAnnotations = pickChapterAnnotations(annotations, ["policy", "frontier", "event", "threshold"]);
  const chapterCAnnotations = pickChapterAnnotations(annotations, ["recommendation", "decision"]);
  const chapterDAnnotations = pickChapterAnnotations(annotations, ["evidence", "recommendation"]);

  return (
    <div className="space-y-8">
      <RouteReveal profile="operations">
        <section className="neo-panel p-5">
          <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)] xl:items-end">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber-100/90">Ops Controls</p>
              <p className="mt-2 text-sm text-slate-300">
                Tune stop-rule threshold and false-positive economics to target
                the efficient intervention frontier.
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
      </RouteReveal>

      <RouteReveal profile="operations" delay={0.04}>
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
            hint="Prevented loss minus false-positive drag"
            accent={derived.expectedNetValue >= 0 ? "emerald" : "crimson"}
          />
          <KpiCard
            label="Recommended Threshold"
            value={formatPct(derived.recommended.threshold, { digits: 0 })}
            hint="Frontier argmax"
            accent="emerald"
          />
          <KpiCard
            label="Triggered Incidents"
            value={formatNumber(derived.zoneTriggered.length)}
            hint={`${derived.zone.name} · active threshold`}
            accent="crimson"
          />
        </div>
      </RouteReveal>

      <RouteReveal profile="operations" delay={0.08}>
        <StoryChapterShell
          chapter="Primary Analysis"
          title="Zone pressure map and synchronized zone cards"
          description="Store-floor command map synchronized with zone pressure and incident volume to localize intervention demand."
          insight={`${derived.zone.name} pressure ${formatPct(derived.zone.theftPressure, { digits: 0 })} with ${formatNumber(derived.eventCountsByZone[derived.zone.id] ?? 0)} incidents.`}
          impact="Click-through zone synchronization localizes where operational posture should tighten first."
          annotationCount={chapterAAnnotations.length}
          tone="amber"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_370px]">
            <section className="neo-panel overflow-hidden p-4" data-testid="primary-chart">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">Zone Command Map</p>
              <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full">
                <rect x={0} y={0} width={width} height={height} rx={16} fill="rgba(255,255,255,0.02)" stroke="rgba(182,169,151,0.18)" />
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
                        stroke={active ? "rgba(139,107,62,0.85)" : "rgba(255,255,255,0.1)"}
                        strokeWidth={active ? 2 : 1}
                        onClick={() => {
                          setSelectedZone(zone.id);
                          setEventCursor(0);
                        }}
                      />
                      <text x={x + 12} y={y + 20} fill="rgba(226,232,240,0.9)" fontSize="12">{zone.name}</text>
                      <text x={x + 12} y={y + 40} fill="rgba(182,169,151,0.9)" fontSize="11">events: {formatNumber(count)}</text>
                    </g>
                  );
                })}

                {payload.initialCameras.map((camera) => (
                  <circle
                    key={camera.id}
                    cx={Math.round(camera.x * scale)}
                    cy={Math.round(camera.y * scale)}
                    r={7}
                    fill="rgba(139,107,62,0.85)"
                    stroke="rgba(226,232,240,0.8)"
                    strokeWidth={1}
                  />
                ))}
              </svg>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {store.zones.map((zone) => (
                  <button
                    key={`card-${zone.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedZone(zone.id);
                      setEventCursor(0);
                    }}
                    className={
                      zone.id === derived.zone.id
                        ? "rounded-xl border border-amber-300/35 bg-amber-300/14 px-3 py-2 text-left"
                        : "rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left hover:bg-white/[0.08]"
                    }
                  >
                    <p className="text-sm text-slate-100">{zone.name}</p>
                    <p className="mt-1 font-mono text-[11px] text-slate-400">
                      pressure {formatPct(zone.theftPressure, { digits: 0 })} · {formatNumber(derived.eventCountsByZone[zone.id] ?? 0)} events
                    </p>
                  </button>
                ))}
              </div>
            </section>
            <EChart option={zonePressureChart} height={620} title="Zone Pressure and Incident Density" className="neo-panel" />
          </div>
          <NarrativeStrip
            title="Zone Annotations"
            subtitle="Pressure concentration and event density identify where intervention scripts should tighten."
            annotations={chapterAAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="operations" delay={0.12}>
        <StoryChapterShell
          chapter="Stress / Scenario"
          title="Threshold frontier and incident stream"
          description="Efficient frontier plots false-positive cost vs recovered net while event stream scrubber exposes intervention load."
          insight={`Current operating point: ${formatUSD(derived.expectedFalsePositiveCost)} FP cost vs ${formatUSD(derived.expectedNetValue)} recovered net.`}
          impact="Frontier + stream inspection prevents overreaction by tying each threshold choice to queue volume and economic drag."
          annotationCount={chapterBAnnotations.length}
          tone="cyan"
        >
          <EChart option={frontierChart} height={620} title="Efficient Frontier (FP Cost vs Recovered Net)" className="neo-panel" />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <EChart option={timelineChart} height={560} title={`Incident Stream · ${derived.zone.name}`} className="neo-panel" />
            <section className="terminal overflow-hidden" data-testid="decision-console">
              <div className="border-b border-white/10 bg-white/5 px-5 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/90">Intervention Log Scrubber</p>
              </div>
              <div className="space-y-3 px-5 py-5 text-sm text-slate-300">
                <Slider
                  label="Event index"
                  value={derived.cursor}
                  min={0}
                  max={Math.max(0, derived.zoneEvents.length - 1)}
                  step={1}
                  onChange={(value) => setEventCursor(value)}
                  formatValue={(value) => `${Math.round(value)}`}
                />
                <p><span className="text-slate-100">Event type:</span> {derived.selectedEvent?.type ?? "—"}</p>
                <p><span className="text-slate-100">P(theft):</span> {derived.selectedEvent ? formatPct(derived.selectedEvent.pTheft, { digits: 0 }) : "—"}</p>
                <p><span className="text-slate-100">Threshold crossed:</span> {derived.selectedEvent && derived.selectedEvent.pTheft >= threshold ? "yes" : "no"}</p>
                <p><span className="text-slate-100">Trigger queue:</span> {formatNumber(derived.zoneTriggered.length)} incidents</p>
              </div>
            </section>
          </div>
          <NarrativeStrip
            title="Scenario Notes"
            subtitle="Scrubber-driven timeline review links policy threshold to operational queue behavior."
            annotations={chapterBAnnotations}
            tone="amber"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="operations" delay={0.16}>
        <StoryChapterShell
          chapter="Decision Console"
          title="Per-store monthly intervention economics"
          description="Monthly economics board combining recovered loss, false-positive burden, and recommendation state."
          insight={`Monthly recovered ${formatUSD(derived.monthlyRecovered)} vs monthly false-positive cost ${formatUSD(derived.monthlyFalsePositive)}.`}
          impact={`Net monthly contribution ${formatUSD(derived.monthlyNet)} at ${formatPct(derived.point.threshold, { digits: 0 })} threshold.`}
          annotationCount={chapterCAnnotations.length}
          tone="crimson"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EChart option={zoneMixChart} height={520} title={`Incident Type Mix · ${derived.zone.name}`} className="neo-panel" />
            <DecisionConsole
              lines={[
                {
                  label: "Recovered loss (monthly)",
                  value: formatUSD(derived.monthlyRecovered),
                  tone: "emerald",
                },
                {
                  label: "False-positive cost (monthly)",
                  value: formatUSD(derived.monthlyFalsePositive),
                  tone: "crimson",
                },
                {
                  label: "Net impact (monthly)",
                  value: formatUSD(derived.monthlyNet),
                  tone: derived.monthlyNet >= 0 ? "emerald" : "crimson",
                },
                {
                  label: "Recommendation state",
                  value:
                    derived.zoneTriggered.length >= 5
                      ? "escalate"
                      : derived.zoneTriggered.length >= 2
                        ? "detain"
                        : "observe",
                  tone: derived.zoneTriggered.length >= 5 ? "crimson" : "amber",
                },
              ]}
            />
          </div>
          <NarrativeStrip
            title="Decision Notes"
            subtitle="Operational recommendation should follow economics and queue pressure together."
            annotations={chapterCAnnotations}
            tone="rose"
            maxItems={4}
          />
        </StoryChapterShell>
      </RouteReveal>

      <RouteReveal profile="operations" delay={0.2}>
        <StoryChapterShell
          chapter="Evidence"
          title="Recommendation evidence trace"
          description="Evidence and decision blocks preserving explainability across thresholds, incidents, and economic state."
          insight={`Evidence packets available: ${formatNumber(payload.decisionEvidence?.length ?? 0)}.`}
          impact="Provides auditability for escalation/observe posture selection in live operations."
          annotationCount={chapterDAnnotations.length}
          tone="amber"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <NarrativeStrip
              title="Evidence Callouts"
              subtitle="Contextual annotations backing the current intervention recommendation."
              annotations={chapterDAnnotations}
              tone="amber"
              maxItems={6}
            />
            <DecisionEvidencePanel title="Intervention Evidence" evidence={payload.decisionEvidence} />
          </div>
        </StoryChapterShell>
      </RouteReveal>
    </div>
  );
}
