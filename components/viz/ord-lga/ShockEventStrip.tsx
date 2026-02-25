"use client";

import { max, scaleLinear } from "d3";
import { formatUSD } from "@/lib/metrics/format";
import type { OrdShockEvent } from "@/components/viz/ord-lga/transforms";

type ShockEventStripProps = {
  events: OrdShockEvent[];
  totalDays: number;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

const severityColor: Record<OrdShockEvent["severity"], string> = {
  low: "var(--radar-amber)",
  med: "var(--radar-crimson)",
  high: "#f43e5e",
};

export function ShockEventStrip({
  events,
  totalDays,
  selectedIndex,
  onSelectIndex,
}: ShockEventStripProps) {
  const width = 980;
  const height = 190;
  const margin = { top: 24, right: 26, bottom: 46, left: 26 };

  const x = scaleLinear()
    .domain([0, Math.max(1, totalDays - 1)])
    .range([margin.left, width - margin.right]);
  const maxRegret = max(events, (event) => Math.max(0, event.regret)) ?? 1;
  const y = scaleLinear().domain([0, maxRegret]).range([height - margin.bottom, margin.top + 20]);

  const selectedEvent =
    events.find((event) => event.dayIndex === selectedIndex) ?? events[0] ?? null;

  return (
    <div className="radar-chart">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="radar-eyebrow">Shock Timeline</p>
        <p className="font-mono text-[12px]" style={{ color: "var(--radar-crimson)" }}>
          {selectedEvent ? `${selectedEvent.date} · ${selectedEvent.severity.toUpperCase()}` : "No shock markers"}
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={height - margin.bottom}
          y2={height - margin.bottom}
          stroke="rgba(148,163,184,0.12)"
          strokeWidth={1}
        />

        {events.map((event) => {
          const xx = x(event.dayIndex);
          const yy = y(event.regret);
          const active = event.dayIndex === selectedIndex;
          return (
            <g key={`${event.date}-${event.dayIndex}`}>
              <line
                x1={xx}
                x2={xx}
                y1={height - margin.bottom}
                y2={yy}
                stroke={severityColor[event.severity]}
                strokeOpacity={active ? 0.9 : 0.4}
                strokeWidth={active ? 2.2 : 1.2}
              />
              <circle
                cx={xx}
                cy={yy}
                r={active ? 7 : 4.5}
                fill={severityColor[event.severity]}
                stroke="rgba(226,232,240,0.7)"
                strokeWidth={active ? 1.8 : 0.8}
                onClick={() => onSelectIndex(event.dayIndex)}
                onMouseEnter={() => onSelectIndex(event.dayIndex)}
                style={{ cursor: "crosshair" }}
              />
              {active ? (
                <text
                  x={xx}
                  y={yy - 12}
                  textAnchor="middle"
                  fontSize={10}
                  fill="rgba(226,232,240,0.85)"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {event.date}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {/* Shock memo */}
      <div className="mt-3 radar-kpi">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Selected Shock Memo</p>
        {selectedEvent ? (
          <>
            <p className="mt-2 text-[13px] text-slate-200">
              {selectedEvent.label} ·{" "}
              <span style={{ color: "var(--radar-crimson)" }}>
                Signal {formatUSD(selectedEvent.regret)}
              </span>
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
              {selectedEvent.narrative}
            </p>
          </>
        ) : (
          <p className="mt-2 text-[12px] text-slate-500">
            No explicit shocks. Regret distribution still highlights reactive pricing gaps.
          </p>
        )}
      </div>
    </div>
  );
}
