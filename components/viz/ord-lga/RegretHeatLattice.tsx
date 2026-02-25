"use client";

import { useMemo, useState } from "react";
import { interpolateRgbBasis, scaleBand, scaleDiverging, scaleSequential } from "d3";
import { formatUSD } from "@/lib/metrics/format";
import type { OrdHeatCell, PolicyViewMode } from "@/components/viz/ord-lga/transforms";

type RegretHeatLatticeProps = {
  mode: PolicyViewMode;
  bookingWindows: number[];
  dows: string[];
  cells: OrdHeatCell[];
  minValue: number;
  maxValue: number;
  activeDow?: string;
};

export function RegretHeatLattice({
  mode,
  bookingWindows,
  dows,
  cells,
  minValue,
  maxValue,
  activeDow,
}: RegretHeatLatticeProps) {
  const width = 860;
  const height = 420;
  const margin = { top: 28, right: 22, bottom: 52, left: 82 };
  const [hovered, setHovered] = useState<OrdHeatCell | null>(null);

  const x = scaleBand<number>()
    .domain(bookingWindows)
    .range([margin.left, width - margin.right])
    .padding(0.08);
  const y = scaleBand<string>()
    .domain(dows)
    .range([margin.top, height - margin.bottom])
    .padding(0.08);

  const color = useMemo(() => {
    if (mode === "delta") {
      const bound = Math.max(Math.abs(minValue), Math.abs(maxValue), 1);
      return scaleDiverging([-bound, 0, bound], (t) =>
        interpolateRgbBasis([
          "rgba(157,49,49,0.88)",
          "rgba(255,255,255,0.09)",
          "rgba(139,107,62,0.9)",
        ])(t),
      );
    }

    const lo = Math.min(minValue, maxValue);
    const hi = Math.max(minValue, maxValue);
    return scaleSequential([lo, hi], (t) =>
      interpolateRgbBasis(["rgba(15,23,42,0.55)", "rgba(139,107,62,0.9)"])(t),
    );
  }, [maxValue, minValue, mode]);

  const maxAbs = Math.max(Math.abs(minValue), Math.abs(maxValue), 1);

  return (
    <div className="radar-chart">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="radar-eyebrow">
          Booking-Window Regret Lattice
        </p>
        <p className="font-mono text-[12px]" style={{ color: "var(--radar-amber)" }}>
          {hovered
            ? `${hovered.dow} · ${hovered.window}d · ${formatUSD(hovered.value, { compact: false })}`
            : `Mode: ${mode.toUpperCase()}`}
        </p>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
        <rect
          x={margin.left}
          y={margin.top}
          width={width - margin.left - margin.right}
          height={height - margin.top - margin.bottom}
          fill="rgba(12,10,9,0.42)"
          rx={14}
        />

        {dows.map((dow) => {
          const yy = (y(dow) ?? margin.top) + (y.bandwidth() / 2);
          return (
            <text
              key={dow}
              x={margin.left - 14}
              y={yy + 4}
              textAnchor="end"
              fontSize={12}
              fill={activeDow === dow ? "var(--radar-amber)" : "rgba(148,163,184,0.7)"}
              style={{ letterSpacing: "0.04em" }}
            >
              {dow}
            </text>
          );
        })}

        {bookingWindows.map((window) => {
          const xx = (x(window) ?? margin.left) + (x.bandwidth() / 2);
          return (
            <text
              key={window}
              x={xx}
              y={height - margin.bottom + 22}
              textAnchor="middle"
              fontSize={11}
              fill="rgba(148,163,184,0.7)"
              style={{ letterSpacing: "0.05em" }}
            >
              {window}d
            </text>
          );
        })}

        {cells.map((cell) => {
          const xx = x(cell.window) ?? margin.left;
          const yy = y(cell.dow) ?? margin.top;
          const isActiveDow = activeDow === cell.dow;
          return (
            <rect
              key={`${cell.dow}-${cell.window}`}
              x={xx}
              y={yy}
              width={x.bandwidth()}
              height={y.bandwidth()}
              rx={8}
              fill={color(cell.value)}
              stroke={
                hovered?.dow === cell.dow && hovered.window === cell.window
                  ? "rgba(226,232,240,0.95)"
                  : isActiveDow
                    ? "var(--radar-amber-50)"
                    : "rgba(255,255,255,0.06)"
              }
              strokeWidth={hovered?.dow === cell.dow && hovered.window === cell.window ? 1.8 : 1}
              onMouseEnter={() => setHovered(cell)}
            />
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <div className="h-2 w-28 rounded-full" style={{ background: "linear-gradient(90deg, var(--radar-crimson), rgba(15,20,36,0.6), var(--radar-amber), var(--radar-green))" }} />
        <p className="font-mono text-[10px] text-slate-500">
          {mode === "delta"
            ? `Delta: -${formatUSD(maxAbs, { compact: false })} to +${formatUSD(maxAbs, { compact: false })}`
            : "Lower → slate | Higher → amber intensity"}
        </p>
      </div>
    </div>
  );
}
