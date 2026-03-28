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
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { ShrinkPayload } from "@/lib/schemas/shrink";
import { buildShrinkRecommendationContract } from "@/lib/viewmodels/shrink";
import {
  buildShrinkEventRef,
  deriveShrinkScenario,
  pickShrinkChapterAnnotations,
} from "@/lib/viewmodels/shrinkScenario";

const EVENT_COLORS: Record<ShrinkPayload["events"][number]["type"], string> = {
  scan: "rgba(73,95,69,0.95)",
  sweep: "rgba(139,107,62,0.95)",
  switch: "rgba(157,49,49,0.95)",
};

const POSTURE_COPY = {
  observe: {
    label: "observe",
    tone: "amber" as const,
    title: "Observe with low-friction interventions",
    summary: "Queue pressure remains light, so keep floor coverage visible while avoiding unnecessary detains.",
  },
  detain: {
    label: "detain",
    tone: "amber" as const,
    title: "Targeted detain workflow",
    summary: "Trigger volume is meaningful enough to hold the zone on targeted checks and manager-ready response scripts.",
  },
  escalate: {
    label: "escalate",
    tone: "crimson" as const,
    title: "Escalate store-floor posture",
    summary: "Triggered queue and expected-value upside justify active intervention, asset protection staffing, and incident logging discipline.",
  },
};

const EVIDENCE_MODE_COPY = {
  clear: {
    label: "Evidence coverage healthy",
    tone: "emerald" as const,
    summary: "Current trust inputs are ready and recommendation evidence is populated for the active operating state.",
  },
  sparse: {
    label: "Sparse evidence mode",
    tone: "amber" as const,
    summary: "Some decision evidence or readiness signals are thin; keep the posture visible but interpret confidence conservatively.",
  },
  degraded: {
    label: "Degraded feed posture",
    tone: "crimson" as const,
    summary: "At least one upstream module is stale, blocked, or unavailable; preserve the queue workflow, but treat economics as partial guidance only.",
  },
};

export default function ShrinkClient({ payload }: { payload: ShrinkPayload }) {
  const [threshold, setThreshold] = useState(0.85);
  const [falsePositiveMultiplier, setFalsePositiveMultiplier] = useState(100);
  const [selectedZone, setSelectedZone] = useState<string>(payload.store.zones[0]?.id ?? "");
  const [selectedEventRef, setSelectedEventRef] = useState(() => {
    const firstEvent = payload.events[0];
    return firstEvent ? buildShrinkEventRef(firstEvent, 0) : null;
  });

  const derived = useMemo(
    () => deriveShrinkScenario(payload, threshold, falsePositiveMultiplier, selectedZone, selectedEventRef),
    [payload, threshold, falsePositiveMultiplier, selectedZone, selectedEventRef],
  );

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
  const chapterAAnnotations = pickShrinkChapterAnnotations(annotations, ["zone", "map", "pressure"]);
  const chapterBAnnotations = pickShrinkChapterAnnotations(annotations, ["policy", "frontier", "event", "threshold"]);
  const chapterCAnnotations = pickShrinkChapterAnnotations(annotations, ["recommendation", "decision"]);
  const chapterDAnnotations = pickShrinkChapterAnnotations(annotations, ["evidence", "recommendation"]);

  const evidenceSummary = EVIDENCE_MODE_COPY[derived.evidenceMode];
  const postureSummary = POSTURE_COPY[derived.posture];
  const recommendationContract = buildShrinkRecommendationContract({
    payload,
    posture: derived.posture,
    evidenceMode: derived.evidenceMode,
    zoneName: derived.zone.name,
    threshold: derived.point.threshold,
    queueCount: derived.zoneTriggered.length,
    falsePositiveMultiplier,
    monthlyNet: derived.monthlyNet,
    monthlyRecovered: derived.monthlyRecovered,
    monthlyFalsePositive: derived.monthlyFalsePositive,
  });
  const activeEventIndex = derived.selectedEvent
    ? payload.events.findIndex((event) => event === derived.selectedEvent)
    : -1;

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
                          const nextEvent = payload.events.find((event) => event.zoneId === zone.id) ?? null;
                          setSelectedEventRef(
                            nextEvent
                              ? buildShrinkEventRef(nextEvent, payload.events.findIndex((event) => event === nextEvent))
                              : null,
                          );
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
                      const nextIndex = payload.events.findIndex((event) => event.zoneId === zone.id);
                      setSelectedEventRef(
                        nextIndex >= 0 ? buildShrinkEventRef(payload.events[nextIndex]!, nextIndex) : null,
                      );
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
          description="Efficient frontier plots false-positive cost vs recovered net while the event stream stays synchronized with the active zone and selected incident."
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
                  label="Zone event index"
                  value={derived.cursor}
                  min={0}
                  max={Math.max(0, derived.zoneEvents.length - 1)}
                  step={1}
                  onChange={(value) => {
                    const nextIndex = Math.round(value);
                    const nextEvent = derived.zoneEvents[nextIndex] ?? null;
                    setSelectedEventRef(
                      nextEvent
                        ? buildShrinkEventRef(
                            nextEvent,
                            payload.events.findIndex((event) => event === nextEvent),
                          )
                        : null,
                    );
                  }}
                  formatValue={(value) => `${Math.round(value)}`}
                />
                <p><span className="text-slate-100">Event type:</span> {derived.selectedEvent?.type ?? "—"}</p>
                <p><span className="text-slate-100">P(theft):</span> {derived.selectedEvent ? formatPct(derived.selectedEvent.pTheft, { digits: 0 }) : "—"}</p>
                <p><span className="text-slate-100">Threshold crossed:</span> {derived.selectedEvent && derived.selectedEvent.pTheft >= threshold ? "yes" : "no"}</p>
                <p><span className="text-slate-100">Global incident id:</span> {activeEventIndex >= 0 ? `#${activeEventIndex}` : "—"}</p>
                <p><span className="text-slate-100">Trigger queue:</span> {formatNumber(derived.zoneTriggered.length)} incidents</p>
              </div>
            </section>
          </div>

          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {derived.zoneEvents.map((event) => {
              const globalIndex = payload.events.findIndex((candidate) => candidate === event);
              const isActive = derived.selectedEvent === event;
              return (
                <button
                  key={`${event.zoneId}-${event.t}-${event.type}`}
                  type="button"
                  onClick={() => setSelectedEventRef(buildShrinkEventRef(event, globalIndex))}
                  className={
                    isActive
                      ? "rounded-2xl border border-amber-300/40 bg-amber-300/12 px-3 py-3 text-left"
                      : "rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left hover:bg-white/[0.07]"
                  }
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-400">t+{event.t}s · {event.type}</p>
                  <p className="mt-1 text-sm text-slate-100">{derived.zone.name}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {formatPct(event.pTheft, { digits: 0 })} theft likelihood · {event.pTheft >= threshold ? "crosses threshold" : "below threshold"}
                  </p>
                </button>
              );
            })}
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
          description="Monthly economics board combining recovered loss, false-positive burden, operational posture, and current trust state."
          insight={`Monthly recovered ${formatUSD(derived.monthlyRecovered)} vs monthly false-positive cost ${formatUSD(derived.monthlyFalsePositive)}.`}
          impact={`Net monthly contribution ${formatUSD(derived.monthlyNet)} at ${formatPct(derived.point.threshold, { digits: 0 })} threshold.`}
          annotationCount={chapterCAnnotations.length}
          tone="crimson"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <EChart option={zoneMixChart} height={520} title={`Incident Type Mix · ${derived.zone.name}`} className="neo-panel" />
            <div className="space-y-4">
              <DecisionConsole
                title="Operational Posture"
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
                    value: postureSummary.label,
                    tone: postureSummary.tone,
                    hint: postureSummary.summary,
                  },
                  {
                    label: "Evidence state",
                    value: evidenceSummary.label,
                    tone: evidenceSummary.tone,
                    hint: evidenceSummary.summary,
                  },
                ]}
              />
              <section className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-300">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/85">Posture brief</p>
                <p className="mt-2 text-slate-100">{postureSummary.title}</p>
                <p className="mt-2 leading-6">{postureSummary.summary}</p>
                <p className="mt-3 leading-6 text-slate-400">
                  Module status: {derived.moduleStatusSummary.length > 0 ? derived.moduleStatusSummary.join(" · ") : "No readiness modules published for this payload."}
                </p>
              </section>
            </div>
          </div>
          <NarrativeStrip
            title="Decision Notes"
            subtitle="Operational recommendation follows economics, queue pressure, and current evidence posture together."
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
          description="Evidence and degraded-feed messaging stay inspectable even when evidence is sparse, stale, or unavailable."
          insight={`Current recommendation trace uses ${formatNumber(recommendationContract.evidence.length)} evidence block${recommendationContract.evidence.length === 1 ? "" : "s"} for the active scenario.`}
          impact="Provides auditability for escalation/observe posture selection in live operations."
          annotationCount={chapterDAnnotations.length}
          tone="amber"
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <NarrativeStrip
                title="Evidence Callouts"
                subtitle="Contextual annotations backing the current intervention recommendation."
                annotations={chapterDAnnotations}
                tone="amber"
                maxItems={6}
              />
              <section className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-slate-300">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/85">Trust posture under sparse feeds</p>
                <p className="mt-2 leading-6">{evidenceSummary.summary}</p>
                <p className="mt-2 leading-6 text-slate-400">
                  Keep the operator workflow live, but narrow confidence when evidence rows thin out or module readiness drops below ready.
                </p>
              </section>
            </div>
            <DecisionEvidencePanel
              title={recommendationContract.evidenceTitle}
              summary={recommendationContract.evidenceSummary}
              footer={recommendationContract.evidenceFooter}
              evidence={recommendationContract.evidence}
            />
          </div>
        </StoryChapterShell>
      </RouteReveal>
    </div>
  );
}
