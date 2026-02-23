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
    <section className="neo-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-feature text-xs uppercase tracking-[0.2em] text-slate-300">
          Nash Response Simulator
        </p>
        <p className="font-mono text-sm text-amber-100">
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
          stroke="rgba(182,169,151,0.4)"
          strokeDasharray="6 6"
        />

        <path d={path(states) ?? ""} fill="none" stroke="rgba(139,107,62,0.95)" strokeWidth={2.8} />
        {states.map((state, index) => (
          <circle
            key={state.dayIndex}
            cx={x(state.uaPrice)}
            cy={y(state.dlPrice)}
            r={index === states.length - 1 ? 6 : 3.6}
            fill={index === states.length - 1 ? "rgba(73,95,69,0.95)" : "rgba(139,107,62,0.85)"}
            stroke="rgba(226,232,240,0.8)"
            strokeWidth={0.8}
          />
        ))}

        {first ? (
          <text x={x(first.uaPrice) + 8} y={y(first.dlPrice) - 8} fontSize={11} fill="rgba(182,169,151,0.95)">
            Start
          </text>
        ) : null}
        {last ? (
          <text x={x(last.uaPrice) + 8} y={y(last.dlPrice) - 8} fontSize={11} fill="rgba(73,95,69,0.95)">
            Equilibrium
          </text>
        ) : null}
      </svg>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="font-feature text-xs uppercase tracking-[0.18em] text-slate-300">UAL Capture</p>
          <p className="mt-2 font-mono text-lg text-amber-200">{formatPct(avgCapture, { digits: 1 })}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="font-feature text-xs uppercase tracking-[0.18em] text-slate-300">Price Spread</p>
          <p className="mt-2 font-mono text-lg text-amber-100">
            {formatUSD((last?.dlPrice ?? 0) - (last?.uaPrice ?? 0), { compact: false })}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="font-feature text-xs uppercase tracking-[0.18em] text-slate-300">Implied NPV</p>
          <p className={`mt-2 font-mono text-lg ${impliedNpv >= 0 ? "text-emerald-200" : "text-rose-200"}`}>
            {formatUSD(impliedNpv)}
          </p>
        </div>
      </div>
    </section>
  );
}
