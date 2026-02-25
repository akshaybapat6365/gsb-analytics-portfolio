"use client";

import { curveMonotoneX, line, max, min, scaleLinear } from "d3";
import { formatNumber, formatUSD } from "@/lib/metrics/format";
import type { OrdDerivedDay } from "@/components/viz/ord-lga/transforms";

type ActualVsAlgoTimelineProps = {
  rows: OrdDerivedDay[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  bookingCurve: Array<{ window: number; actual: number; counterfactual: number }>;
};

function indexFromPointer(clientX: number, left: number, width: number, count: number) {
  const normalized = (clientX - left) / Math.max(1, width);
  return Math.max(0, Math.min(count - 1, Math.round(normalized * (count - 1))));
}

export function ActualVsAlgoTimeline({
  rows,
  selectedIndex,
  onSelectIndex,
  bookingCurve,
}: ActualVsAlgoTimelineProps) {
  const width = 1180;
  const height = 360;
  const margin = { top: 30, right: 26, bottom: 50, left: 54 };
  const selected = rows[selectedIndex] ?? rows[0];

  const x = scaleLinear()
    .domain([0, Math.max(0, rows.length - 1)])
    .range([margin.left, width - margin.right]);
  const y = scaleLinear()
    .domain([
      (min(rows, (d) => Math.min(d.actualPrice, d.algoPrice, d.policyPrice)) ?? 200) - 10,
      (max(rows, (d) => Math.max(d.actualPrice, d.algoPrice, d.policyPrice)) ?? 360) + 10,
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const lineGen = line<OrdDerivedDay>()
    .curve(curveMonotoneX)
    .x((d) => x(d.index))
    .y((d) => y(d.actualPrice));
  const algoLineGen = line<OrdDerivedDay>()
    .curve(curveMonotoneX)
    .x((d) => x(d.index))
    .y((d) => y(d.algoPrice));
  const policyLineGen = line<OrdDerivedDay>()
    .curve(curveMonotoneX)
    .x((d) => x(d.index))
    .y((d) => y(d.policyPrice));

  const curveWidth = 640;
  const curveHeight = 230;
  const curveMargin = { top: 18, right: 20, bottom: 42, left: 46 };
  const sortedCurve = [...bookingCurve].sort((a, b) => b.window - a.window);
  const xCurve = scaleLinear()
    .domain([
      min(sortedCurve, (d) => d.window) ?? 1,
      max(sortedCurve, (d) => d.window) ?? 30,
    ])
    .range([curveMargin.left, curveWidth - curveMargin.right]);
  const yCurve = scaleLinear()
    .domain([0, max(sortedCurve, (d) => Math.max(d.actual, d.counterfactual)) ?? 1])
    .nice()
    .range([curveHeight - curveMargin.bottom, curveMargin.top]);
  const actualCurvePath = line<{ window: number; actual: number }>()
    .curve(curveMonotoneX)
    .x((d) => xCurve(d.window))
    .y((d) => yCurve(d.actual));
  const counterfactualCurvePath = line<{ window: number; counterfactual: number }>()
    .curve(curveMonotoneX)
    .x((d) => xCurve(d.window))
    .y((d) => yCurve(d.counterfactual));

  const defaultRow: OrdDerivedDay = rows[0] ?? {
    index: 0, date: "n/a", dow: "n/a", week: 0, shock: 0,
    actualPrice: 0, algoPrice: 0, policyPrice: 0, competitorPrice: 0,
    actualPax: 0, policyPax: 0, actualRevenue: 0, policyRevenue: 0,
    policyRegret: 0, uaShare: 0,
  };

  const annotations = [
    {
      key: "max-regret",
      label: "Max policy lift",
      row: rows.reduce((best, row) => (row.policyRegret > best.policyRegret ? row : best), defaultRow),
      color: "var(--radar-green)",
    },
    {
      key: "max-leak",
      label: "Max leakage day",
      row: rows.reduce((best, row) => (row.policyRegret < best.policyRegret ? row : best), defaultRow),
      color: "var(--radar-crimson)",
    },
    {
      key: "max-shock",
      label: "Strongest demand shock",
      row: rows.reduce((best, row) => (row.shock > best.shock ? row : best), defaultRow),
      color: "var(--radar-amber)",
    },
  ];

  return (
    <section className="space-y-4">
      {/* Daily Fare Strip */}
      <div className="radar-chart">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="radar-eyebrow">Daily Fare Strip</p>
          <p className="font-mono text-[12px]" style={{ color: "var(--radar-amber)" }}>
            {selected?.date ?? "—"} · Policy {formatUSD(selected?.policyPrice ?? 0)}
          </p>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
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

          <path d={lineGen(rows) ?? ""} fill="none" stroke="rgba(148,163,184,0.6)" strokeWidth={1.8} />
          <path d={algoLineGen(rows) ?? ""} fill="none" stroke="var(--radar-green)" strokeWidth={2} opacity={0.7} />
          <path d={policyLineGen(rows) ?? ""} fill="none" stroke="var(--radar-amber)" strokeWidth={2.6} />

          {selected ? (
            <g>
              <line
                x1={x(selected.index)}
                x2={x(selected.index)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="rgba(226,232,240,0.3)"
                strokeDasharray="3 5"
              />
              <circle cx={x(selected.index)} cy={y(selected.policyPrice)} r={4.5} fill="var(--radar-amber)" stroke="rgba(226,232,240,0.5)" strokeWidth={1} />
            </g>
          ) : null}

          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            fill="transparent"
            style={{ cursor: "crosshair" }}
            onMouseMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              onSelectIndex(indexFromPointer(event.clientX, bounds.left, bounds.width, rows.length));
            }}
            onClick={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              onSelectIndex(indexFromPointer(event.clientX, bounds.left, bounds.width, rows.length));
            }}
          />
        </svg>
      </div>

      {/* Booking Curve + Selected Day Readout */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="radar-chart">
          <p className="radar-eyebrow">Booking Curve</p>
          <svg viewBox={`0 0 ${curveWidth} ${curveHeight}`} className="mt-3 h-auto w-full">
            {[0, 0.33, 0.66, 1].map((tick) => {
              const yy = curveMargin.top + tick * (curveHeight - curveMargin.bottom - curveMargin.top);
              return (
                <line
                  key={tick}
                  x1={curveMargin.left}
                  x2={curveWidth - curveMargin.right}
                  y1={yy}
                  y2={yy}
                  stroke="rgba(148,163,184,0.06)"
                  strokeDasharray="3 5"
                />
              );
            })}
            <path d={actualCurvePath(sortedCurve) ?? ""} fill="none" stroke="rgba(148,163,184,0.6)" strokeWidth={1.8} />
            <path d={counterfactualCurvePath(sortedCurve) ?? ""} fill="none" stroke="var(--radar-amber)" strokeWidth={2.4} />
            {sortedCurve.map((point) => (
              <g key={point.window}>
                <circle cx={xCurve(point.window)} cy={yCurve(point.actual)} r={3} fill="rgba(148,163,184,0.7)" />
                <circle cx={xCurve(point.window)} cy={yCurve(point.counterfactual)} r={3} fill="var(--radar-amber)" />
              </g>
            ))}
          </svg>
        </div>

        <div className="radar-panel overflow-hidden">
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--radar-border)", background: "rgba(15,20,36,0.5)" }}>
            <p className="radar-eyebrow">Selected Day Readout</p>
          </div>
          <div className="space-y-2.5 px-5 py-4 text-[12px]">
            <p className="text-slate-300">
              <span className="text-slate-100">Actual:</span>{" "}
              {formatUSD(selected?.actualPrice ?? 0)} · {formatNumber(selected?.actualPax ?? 0)} pax
            </p>
            <p className="text-slate-300">
              <span className="text-slate-100">Counterfactual:</span>{" "}
              {formatUSD(selected?.policyPrice ?? 0)} · {formatNumber(selected?.policyPax ?? 0)} pax
            </p>
            <p className="text-slate-300">
              <span className="text-slate-100">Revenue delta:</span>{" "}
              <span style={{ color: (selected?.policyRegret ?? 0) >= 0 ? "var(--radar-green)" : "var(--radar-crimson)" }}>
                {formatUSD(selected?.policyRegret ?? 0)}
              </span>
            </p>
            <p className="text-slate-500">
              Day captures {formatNumber((selected?.uaShare ?? 0) * 100, { digits: 1 })}% share
            </p>
          </div>
        </div>
      </section>

      {/* Annotation cards */}
      <section className="grid gap-3 lg:grid-cols-3">
        {annotations.map((item) => (
          <div key={item.key} className="radar-kpi">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
            <p className="mt-1 text-[12px] text-slate-300">{item.row.date} · {item.row.dow}</p>
            <p className="mt-1 font-mono text-[13px]" style={{ color: item.color }}>
              {formatUSD(item.row.policyRegret)}
            </p>
          </div>
        ))}
      </section>
    </section>
  );
}
