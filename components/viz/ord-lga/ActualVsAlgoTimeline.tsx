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

  return (
    <section className="space-y-4">
      <section className="neo-panel p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-feature text-xs uppercase tracking-[0.2em] text-slate-300">
            Daily Fare Strip
          </p>
          <p className="font-mono text-sm text-cyan-100">
            {selected?.date ?? "—"} · Policy {formatUSD(selected?.policyPrice ?? 0)}
          </p>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const yy = margin.top + tick * (height - margin.bottom - margin.top);
            return (
              <line
                key={tick}
                x1={margin.left}
                x2={width - margin.right}
                y1={yy}
                y2={yy}
                stroke="rgba(148,163,184,0.14)"
                strokeDasharray="4 6"
              />
            );
          })}

          <path d={lineGen(rows) ?? ""} fill="none" stroke="rgba(148,163,184,0.95)" strokeWidth={2.1} />
          <path d={algoLineGen(rows) ?? ""} fill="none" stroke="rgba(52,211,153,0.95)" strokeWidth={2.4} />
          <path d={policyLineGen(rows) ?? ""} fill="none" stroke="rgba(34,211,238,1)" strokeWidth={3} />

          {selected ? (
            <g>
              <line
                x1={x(selected.index)}
                x2={x(selected.index)}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="rgba(226,232,240,0.55)"
                strokeDasharray="4 5"
              />
              <circle cx={x(selected.index)} cy={y(selected.policyPrice)} r={4.8} fill="rgba(34,211,238,1)" />
            </g>
          ) : null}

          <rect
            x={margin.left}
            y={margin.top}
            width={width - margin.left - margin.right}
            height={height - margin.top - margin.bottom}
            fill="transparent"
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
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="neo-panel p-4">
          <p className="font-feature text-xs uppercase tracking-[0.2em] text-slate-300">
            Booking Curve
          </p>
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
                  stroke="rgba(148,163,184,0.14)"
                  strokeDasharray="3 5"
                />
              );
            })}
            <path d={actualCurvePath(sortedCurve) ?? ""} fill="none" stroke="rgba(148,163,184,0.95)" strokeWidth={2.4} />
            <path d={counterfactualCurvePath(sortedCurve) ?? ""} fill="none" stroke="rgba(34,211,238,0.98)" strokeWidth={2.9} />
            {sortedCurve.map((point) => (
              <g key={point.window}>
                <circle cx={xCurve(point.window)} cy={yCurve(point.actual)} r={3.2} fill="rgba(148,163,184,0.95)" />
                <circle cx={xCurve(point.window)} cy={yCurve(point.counterfactual)} r={3.2} fill="rgba(34,211,238,0.95)" />
              </g>
            ))}
          </svg>
        </section>

        <section className="terminal overflow-hidden">
          <div className="border-b border-white/10 bg-white/5 px-5 py-4">
            <p className="font-feature text-xs uppercase tracking-[0.18em] text-slate-300">
              Selected Day Readout
            </p>
          </div>
          <div className="space-y-3 px-5 py-5 text-sm">
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
              <span className="text-emerald-200">{formatUSD(selected?.policyRegret ?? 0)}</span>
            </p>
            <p className="text-slate-400">
              Selected day captures {formatNumber((selected?.uaShare ?? 0) * 100, { digits: 1 })}% share.
            </p>
          </div>
        </section>
      </section>
    </section>
  );
}
