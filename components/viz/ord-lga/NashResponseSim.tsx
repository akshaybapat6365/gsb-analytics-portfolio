"use client";

import { curveMonotoneX, line, max, min, scaleLinear } from "d3";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { OrdNashState } from "@/components/viz/ord-lga/transforms";

type NashResponseSimProps = {
  states: OrdNashState[];
  convergenceDay: number;
};

export function NashResponseSim({ states, convergenceDay }: NashResponseSimProps) {
  const width = 960;
  const height = 400;
  const margin = { top: 26, right: 26, bottom: 48, left: 56 };

  const x = scaleLinear()
    .domain([
      (min(states, (d) => Math.min(d.uaPrice, d.dlPrice)) ?? 200) - 8,
      (max(states, (d) => Math.max(d.uaPrice, d.dlPrice)) ?? 360) + 8,
    ])
    .nice()
    .range([margin.left, width - margin.right]);
  const y = scaleLinear()
    .domain([
      (min(states, (d) => Math.min(d.uaPrice, d.dlPrice)) ?? 200) - 8,
      (max(states, (d) => Math.max(d.uaPrice, d.dlPrice)) ?? 360) + 8,
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const path = line<OrdNashState>()
    .curve(curveMonotoneX)
    .x((d) => x(d.uaPrice))
    .y((d) => y(d.dlPrice));

  const first = states[0];
  const last = states[states.length - 1];
  const avgCapture = states.reduce((acc, row) => acc + row.uaShare, 0) / Math.max(1, states.length);
  const impliedNpv = states.reduce((acc, row) => acc + row.regret, 0) * 44 - 1_900_000;

  return (
    <div className="radar-chart">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="radar-eyebrow">
          Nash Response Simulator
        </p>
        <p className="font-mono text-[12px]" style={{ color: "var(--radar-amber)" }}>
          Convergence day: {formatNumber(convergenceDay)}
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const yy = margin.top + tick * (height - margin.bottom - margin.top);
          return (
            <line
              key={`h-${tick}`}
              x1={margin.left}
              x2={width - margin.right}
              y1={yy}
              y2={yy}
              stroke="rgba(182,169,151,0.12)"
            />
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const xx = margin.left + tick * (width - margin.left - margin.right);
          return (
            <line
              key={`v-${tick}`}
              x1={xx}
              x2={xx}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke="rgba(182,169,151,0.12)"
            />
          );
        })}

        <line
          x1={x(x.domain()[0])}
          y1={y(x.domain()[0])}
          x2={x(x.domain()[1])}
          y2={y(x.domain()[1])}
          stroke="rgba(148,163,184,0.2)"
          strokeDasharray="6 6"
        />

        <path d={path(states) ?? ""} fill="none" stroke="var(--radar-amber)" strokeWidth={2.8} />
        {states.map((state, index) => (
          <circle
            key={state.dayIndex}
            cx={x(state.uaPrice)}
            cy={y(state.dlPrice)}
            r={index === states.length - 1 ? 6 : 3.6}
            fill={index === states.length - 1 ? "var(--radar-green)" : "var(--radar-amber)"}
            stroke="rgba(226,232,240,0.8)"
            strokeWidth={0.8}
          />
        ))}

        {first ? (
          <text x={x(first.uaPrice) + 8} y={y(first.dlPrice) - 8} fontSize={10} fill="rgba(148,163,184,0.7)" fontFamily="JetBrains Mono, monospace">
            Start
          </text>
        ) : null}
        {last ? (
          <text x={x(last.uaPrice) + 8} y={y(last.dlPrice) - 8} fontSize={10} fill="var(--radar-green)" fontFamily="JetBrains Mono, monospace">
            Equilibrium
          </text>
        ) : null}
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="radar-kpi">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">UAL Capture</p>
          <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-amber)" }}>{formatPct(avgCapture, { digits: 1 })}</p>
        </div>
        <div className="radar-kpi">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Price Spread</p>
          <p className="mt-1 font-mono text-lg" style={{ color: "var(--radar-amber)" }}>
            {formatUSD((last?.dlPrice ?? 0) - (last?.uaPrice ?? 0), { compact: false })}
          </p>
        </div>
        <div className="radar-kpi">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">Implied NPV</p>
          <p className="mt-1 font-mono text-lg" style={{ color: impliedNpv >= 0 ? "var(--radar-green)" : "var(--radar-crimson)" }}>
            {formatUSD(impliedNpv)}
          </p>
        </div>
      </div>
    </div>
  );
}
