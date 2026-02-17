"use client";

import { useMemo, useState } from "react";
import { area, curveCatmullRom, line, max, min, scaleLinear } from "d3";
import { motion } from "framer-motion";

type PulseMode = "alpha" | "risk" | "allocation";

type Point = {
  step: number;
  primary: number;
  secondary: number;
  stress: number;
};

const MODES: Array<{ id: PulseMode; label: string }> = [
  { id: "alpha", label: "Alpha Pulse" },
  { id: "risk", label: "Risk Surface" },
  { id: "allocation", label: "Allocation Shift" },
];

function buildSeries(mode: PulseMode): Point[] {
  return Array.from({ length: 42 }, (_, idx) => {
    const t = idx / 41;
    const waveA = Math.sin((idx + 3) * 0.28);
    const waveB = Math.cos((idx + 5) * 0.21);
    const waveC = Math.sin((idx + 11) * 0.16);

    if (mode === "risk") {
      return {
        step: idx,
        primary: 58 + 12 * waveA + 9 * waveB + t * 13,
        secondary: 55 + 16 * waveB + 6 * waveC + t * 10,
        stress: 35 + 20 * (1 - t) + 10 * waveC,
      };
    }

    if (mode === "allocation") {
      return {
        step: idx,
        primary: 45 + 20 * waveA + t * 26,
        secondary: 40 + 18 * waveB + t * 21,
        stress: 64 - t * 22 + 10 * waveC,
      };
    }

    return {
      step: idx,
      primary: 52 + 15 * waveA + t * 22,
      secondary: 49 + 11 * waveB + t * 18,
      stress: 44 + 8 * waveC + t * 8,
    };
  });
}

export function PortfolioPulse() {
  const [mode, setMode] = useState<PulseMode>("alpha");
  const series = useMemo(() => buildSeries(mode), [mode]);
  const width = 760;
  const height = 330;
  const margin = { top: 26, right: 26, bottom: 42, left: 32 };

  const x = scaleLinear()
    .domain([0, series.length - 1])
    .range([margin.left, width - margin.right]);
  const y = scaleLinear()
    .domain([
      (min(series, (d) => Math.min(d.primary, d.secondary, d.stress)) ?? 20) - 10,
      (max(series, (d) => Math.max(d.primary, d.secondary, d.stress)) ?? 80) + 8,
    ])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const linePrimary = line<Point>()
    .curve(curveCatmullRom.alpha(0.5))
    .x((d) => x(d.step))
    .y((d) => y(d.primary));
  const lineSecondary = line<Point>()
    .curve(curveCatmullRom.alpha(0.5))
    .x((d) => x(d.step))
    .y((d) => y(d.secondary));
  const lineStress = line<Point>()
    .curve(curveCatmullRom.alpha(0.5))
    .x((d) => x(d.step))
    .y((d) => y(d.stress));
  const fillArea = area<Point>()
    .curve(curveCatmullRom.alpha(0.5))
    .x((d) => x(d.step))
    .y0(height - margin.bottom)
    .y1((d) => y(d.primary));

  const finalPoint = series[series.length - 1];
  const delta = (finalPoint?.primary ?? 0) - (series[0]?.primary ?? 0);

  return (
    <div className="neo-panel overflow-hidden p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Portfolio Signal Engine
        </p>
        <div className="flex flex-wrap gap-1.5">
          {MODES.map((item) => {
            const active = item.id === mode;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={
                  active
                    ? "rounded-full border border-cyan-300/35 bg-cyan-300/12 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-cyan-100"
                    : "rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-300 hover:bg-white/[0.08]"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full">
        <defs>
          <linearGradient id="pulse-fill" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.35)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.02)" />
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
              stroke="rgba(148,163,184,0.15)"
              strokeDasharray="4 6"
            />
          );
        })}

        <motion.path
          d={fillArea(series) ?? ""}
          fill="url(#pulse-fill)"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: 0.95 }}
          transition={{ duration: 0.45 }}
        />
        <motion.path
          d={lineStress(series) ?? ""}
          fill="none"
          stroke="rgba(251,113,133,0.78)"
          strokeWidth={1.8}
          strokeDasharray="8 8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <motion.path
          d={lineSecondary(series) ?? ""}
          fill="none"
          stroke="rgba(52,211,153,0.95)"
          strokeWidth={2.2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />
        <motion.path
          d={linePrimary(series) ?? ""}
          fill="none"
          stroke="rgba(34,211,238,0.95)"
          strokeWidth={3}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>

      <div className="grid gap-3 pt-2 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-slate-400">Composite Lift</p>
          <p className="mt-2 font-mono text-lg text-cyan-100">{delta.toFixed(1)} pts</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-slate-400">Active Signal</p>
          <p className="mt-2 font-mono text-lg text-emerald-100">{mode.toUpperCase()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-slate-400">Stress Index</p>
          <p className="mt-2 font-mono text-lg text-rose-100">{(finalPoint?.stress ?? 0).toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
