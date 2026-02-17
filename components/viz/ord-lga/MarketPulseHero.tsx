"use client";

import { area, line, max, min, scaleLinear } from "d3";
import type { MouseEvent } from "react";
import { formatNumber, formatPct, formatUSD } from "@/lib/metrics/format";
import type { OrdDerivedDay } from "@/components/viz/ord-lga/transforms";

type MarketPulseHeroProps = {
  rows: OrdDerivedDay[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
};

function nearestIndex(
  event: MouseEvent<SVGRectElement>,
  width: number,
  marginLeft: number,
  marginRight: number,
  count: number,
) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const innerLeft = marginLeft;
  const innerRight = width - marginRight;
  const clamped = Math.max(innerLeft, Math.min(innerRight, x));
  const ratio = (clamped - innerLeft) / Math.max(1, innerRight - innerLeft);
  return Math.round(ratio * Math.max(0, count - 1));
}

export function MarketPulseHero({
  rows,
  selectedIndex,
  onSelectIndex,
}: MarketPulseHeroProps) {
  const width = 1180;
  const height = 370;
  const margin = { top: 28, right: 30, bottom: 54, left: 60 };
  const selected = rows[selectedIndex] ?? rows[0];

  const x = scaleLinear()
    .domain([0, Math.max(0, rows.length - 1)])
    .range([margin.left, width - margin.right]);
  const y = scaleLinear()
    .domain([
      (min(rows, (d) => Math.min(d.actualPrice, d.policyPrice, d.competitorPrice)) ?? 200) -
        9,
      (max(rows, (d) => Math.max(d.actualPrice, d.policyPrice, d.competitorPrice)) ?? 360) +
        8,
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);
  const yRegret = scaleLinear()
    .domain([0, max(rows, (d) => Math.max(0, d.policyRegret)) ?? 1])
    .range([height - margin.bottom, height - margin.bottom - 120]);

  const actualLine = line<OrdDerivedDay>()
    .x((d) => x(d.index))
    .y((d) => y(d.actualPrice));
  const policyLine = line<OrdDerivedDay>()
    .x((d) => x(d.index))
    .y((d) => y(d.policyPrice));
  const competitorLine = line<OrdDerivedDay>()
    .x((d) => x(d.index))
    .y((d) => y(d.competitorPrice));
  const regretArea = area<OrdDerivedDay>()
    .x((d) => x(d.index))
    .y0(height - margin.bottom)
    .y1((d) => yRegret(Math.max(0, d.policyRegret)));

  const totalRegret = rows.reduce((acc, row) => acc + row.policyRegret, 0);
  const avgShare = rows.reduce((acc, row) => acc + row.uaShare, 0) / Math.max(1, rows.length);
  const totalPolicyRevenue = rows.reduce((acc, row) => acc + row.policyRevenue, 0);

  return (
    <section className="neo-panel overflow-hidden p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-feature text-xs uppercase tracking-[0.22em] text-cyan-100/80">
            Market Pulse Engine
          </p>
          <p className="mt-2 font-mono text-sm text-slate-300">
            {selected?.date ?? "—"} · {selected?.dow ?? "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-slate-300/25 bg-slate-400/10 px-3 py-1 font-mono uppercase tracking-[0.14em] text-slate-200">
            Actual
          </span>
          <span className="rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1 font-mono uppercase tracking-[0.14em] text-cyan-100">
            Policy
          </span>
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 font-mono uppercase tracking-[0.14em] text-amber-100">
            Competitor
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
        <defs>
          <linearGradient id="ord-regret-fill" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.40)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.02)" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
          const yy = margin.top + tick * (height - margin.bottom - margin.top);
          return (
            <line
              key={tick}
              x1={margin.left}
              x2={width - margin.right}
              y1={yy}
              y2={yy}
              stroke="rgba(148,163,184,0.16)"
              strokeDasharray="4 7"
            />
          );
        })}

        <path d={regretArea(rows) ?? ""} fill="url(#ord-regret-fill)" />
        <path d={actualLine(rows) ?? ""} fill="none" stroke="rgba(148,163,184,0.95)" strokeWidth={2.1} />
        <path
          d={competitorLine(rows) ?? ""}
          fill="none"
          stroke="rgba(251,191,36,0.85)"
          strokeWidth={2.2}
          strokeDasharray="8 6"
        />
        <path d={policyLine(rows) ?? ""} fill="none" stroke="rgba(34,211,238,1)" strokeWidth={3} />

        {rows
          .filter((row) => row.shock > 0)
          .map((row) => (
            <circle
              key={row.date}
              cx={x(row.index)}
              cy={y(row.policyPrice)}
              r={4 + row.shock * 4}
              fill="rgba(251,113,133,0.18)"
              stroke="rgba(251,113,133,0.95)"
              strokeWidth={1.5}
            />
          ))}

        {selected ? (
          <g>
            <line
              x1={x(selected.index)}
              x2={x(selected.index)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke="rgba(226,232,240,0.56)"
              strokeDasharray="4 6"
            />
            <circle cx={x(selected.index)} cy={y(selected.policyPrice)} r={5.5} fill="rgba(34,211,238,1)" />
          </g>
        ) : null}

        <text
          x={margin.left}
          y={height - 16}
          fontSize={11}
          fill="rgba(148,163,184,0.92)"
          style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          Q2 timeline
        </text>
        <text
          x={margin.left}
          y={margin.top - 8}
          fontSize={11}
          fill="rgba(148,163,184,0.92)"
          style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          Fare ($)
        </text>

        <rect
          x={margin.left}
          y={margin.top}
          width={width - margin.left - margin.right}
          height={height - margin.top - margin.bottom}
          fill="transparent"
          onMouseMove={(event) =>
            onSelectIndex(nearestIndex(event, width, margin.left, margin.right, rows.length))
          }
          onClick={(event) =>
            onSelectIndex(nearestIndex(event, width, margin.left, margin.right, rows.length))
          }
        />
      </svg>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-slate-400">
            Counterfactual Lift
          </p>
          <p className="mt-2 font-mono text-xl text-emerald-200">{formatUSD(totalRegret)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-slate-400">
            UAL Share (Avg)
          </p>
          <p className="mt-2 font-mono text-xl text-cyan-200">{formatPct(avgShare, { digits: 0 })}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-slate-400">
            Policy Revenue
          </p>
          <p className="mt-2 font-mono text-xl text-amber-100">{formatUSD(totalPolicyRevenue)}</p>
          <p className="mt-1 text-xs text-slate-400">
            Selected regret: {formatUSD(selected?.policyRegret ?? 0)} ·{" "}
            {formatNumber(selected?.policyPax ?? 0)} pax
          </p>
        </div>
      </div>
    </section>
  );
}
