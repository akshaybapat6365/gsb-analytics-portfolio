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
  low: "rgba(251,191,36,0.92)",
  med: "rgba(251,113,133,0.95)",
  high: "rgba(244,63,94,0.98)",
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
    <section className="neo-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-feature text-xs uppercase tracking-[0.2em] text-slate-300">
          Shock Timeline
        </p>
        <p className="font-mono text-sm text-rose-100">
          {selectedEvent ? `${selectedEvent.date} · ${selectedEvent.severity.toUpperCase()}` : "No shock markers"}
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={height - margin.bottom}
          y2={height - margin.bottom}
          stroke="rgba(148,163,184,0.24)"
          strokeWidth={1.4}
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
                strokeOpacity={active ? 0.9 : 0.45}
                strokeWidth={active ? 2.2 : 1.4}
              />
              <circle
                cx={xx}
                cy={yy}
                r={active ? 7 : 5}
                fill={severityColor[event.severity]}
                stroke="rgba(248,250,252,0.92)"
                strokeWidth={active ? 1.8 : 1}
                onClick={() => onSelectIndex(event.dayIndex)}
                onMouseEnter={() => onSelectIndex(event.dayIndex)}
              />
              {active ? (
                <text
                  x={xx}
                  y={yy - 10}
                  textAnchor="middle"
                  fontSize={11}
                  fill="rgba(226,232,240,0.95)"
                >
                  {event.date}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="font-feature text-xs uppercase tracking-[0.18em] text-slate-300">Selected Shock Memo</p>
        {selectedEvent ? (
          <>
            <p className="mt-2 text-sm text-slate-100">
              {selectedEvent.label} ·{" "}
              <span className="text-rose-200">
                Regret signal {formatUSD(selectedEvent.regret)}
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {selectedEvent.narrative}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            No explicit shocks in this sample. Regret distribution still highlights reactive pricing gaps.
          </p>
        )}
      </div>
    </section>
  );
}
