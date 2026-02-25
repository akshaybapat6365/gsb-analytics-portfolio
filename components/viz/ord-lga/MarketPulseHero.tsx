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
      (min(rows, (d) => Math.min(d.actualPrice, d.policyPrice, d.competitorPrice)) ?? 200) - 9,
      (max(rows, (d) => Math.max(d.actualPrice, d.policyPrice, d.competitorPrice)) ?? 360) + 8,
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
    <div className="radar-chart">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="radar-eyebrow">Market Pulse Engine</p>
          <p className="mt-1 font-mono text-[12px] text-slate-400">
            {selected?.date ?? "—"} · {selected?.dow ?? "—"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span
            className="rounded-full border px-3 py-1 font-mono uppercase tracking-[0.14em]"
            style={{ borderColor: "rgba(148,163,184,0.25)", background: "rgba(148,163,184,0.08)", color: "rgba(148,163,184,0.9)" }}
          >
            Actual
          </span>
          <span
            className="rounded-full border px-3 py-1 font-mono uppercase tracking-[0.14em]"
            style={{ borderColor: "var(--radar-amber-50)", background: "var(--radar-amber-08)", color: "var(--radar-amber)" }}
          >
            Policy
          </span>
          <span
            className="rounded-full border px-3 py-1 font-mono uppercase tracking-[0.14em]"
            style={{ borderColor: "var(--radar-cyan-20)", background: "rgba(77,184,217,0.06)", color: "var(--radar-cyan)" }}
          >
            Competitor
          </span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
        <defs>
          <linearGradient id="ord-regret-fill" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(224,69,58,0.22)" />
            <stop offset="100%" stopColor="rgba(224,69,58,0.02)" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {y.ticks(5).map((tick) => (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={width - margin.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="rgba(148,163,184,0.06)"
              strokeDasharray="3 5"
            />
            <text
              x={margin.left - 8}
              y={y(tick) + 4}
              textAnchor="end"
              fontSize={10}
              fill="rgba(148,163,184,0.5)"
              fontFamily="JetBrains Mono, monospace"
            >
              ${Math.round(tick)}
            </text>
          </g>
        ))}

        <path d={regretArea(rows) ?? ""} fill="url(#ord-regret-fill)" />
        <path d={actualLine(rows) ?? ""} fill="none" stroke="rgba(148,163,184,0.75)" strokeWidth={1.8} />
        <path
          d={competitorLine(rows) ?? ""}
          fill="none"
          stroke="var(--radar-cyan)"
          strokeWidth={1.8}
          strokeDasharray="6 4"
          opacity={0.7}
        />
        <path d={policyLine(rows) ?? ""} fill="none" stroke="var(--radar-amber)" strokeWidth={2.6} />

        {/* Shock markers */}
        {rows
          .filter((row) => row.shock > 0)
          .map((row) => (
            <circle
              key={row.date}
              cx={x(row.index)}
              cy={y(row.policyPrice)}
              r={4 + row.shock * 4}
              fill="var(--radar-crimson-20)"
              stroke="var(--radar-crimson)"
              strokeWidth={1.5}
            />
          ))}

        {/* Selected day crosshair */}
        {selected ? (
          <g>
            <line
              x1={x(selected.index)}
              x2={x(selected.index)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke="rgba(226,232,240,0.35)"
              strokeDasharray="3 5"
            />
            <circle cx={x(selected.index)} cy={y(selected.policyPrice)} r={5} fill="var(--radar-amber)" stroke="rgba(226,232,240,0.6)" strokeWidth={1.2} />
          </g>
        ) : null}

        {/* Axis labels */}
        <text
          x={margin.left}
          y={height - 12}
          fontSize={10}
          fill="rgba(148,163,184,0.45)"
          fontFamily="JetBrains Mono, monospace"
          style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
        >
          Q2 2023 Timeline
        </text>
        <text
          x={margin.left}
          y={margin.top - 8}
          fontSize={10}
          fill="rgba(148,163,184,0.45)"
          fontFamily="JetBrains Mono, monospace"
          style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
        >
          Fare ($)
        </text>

        {/* Interaction overlay */}
        <rect
          x={margin.left}
          y={margin.top}
          width={width - margin.left - margin.right}
          height={height - margin.top - margin.bottom}
          fill="transparent"
          style={{ cursor: "crosshair" }}
          onMouseMove={(event) =>
            onSelectIndex(nearestIndex(event, width, margin.left, margin.right, rows.length))
          }
          onClick={(event) =>
            onSelectIndex(nearestIndex(event, width, margin.left, margin.right, rows.length))
          }
        />
      </svg>

      {/* KPI strip */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="radar-kpi radar-glow-green">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-green)" }}>
            Counterfactual Lift
          </p>
          <p className="mt-1 font-mono text-xl" style={{ color: "var(--radar-green)" }}>{formatUSD(totalRegret)}</p>
        </div>
        <div className="radar-kpi radar-glow-amber">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-amber)" }}>
            UAL Share (Avg)
          </p>
          <p className="mt-1 font-mono text-xl" style={{ color: "var(--radar-amber)" }}>{formatPct(avgShare, { digits: 0 })}</p>
        </div>
        <div className="radar-kpi">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
            Policy Revenue
          </p>
          <p className="mt-1 font-mono text-xl text-slate-200">{formatUSD(totalPolicyRevenue)}</p>
          <p className="mt-1 text-[10px] text-slate-500">
            Day Δ: {formatUSD(selected?.policyRegret ?? 0)} · {formatNumber(selected?.policyPax ?? 0)} pax
          </p>
        </div>
      </div>
    </div>
  );
}
