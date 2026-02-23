"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { line, scaleLinear } from "d3";
import { motion, useReducedMotion } from "framer-motion";
import { MetricCount } from "@/components/motion/MetricCount";
import type {
  HomeHeroVM,
  HomeKpiItem,
  HomeSignalMode,
  HomeSignalModeId,
} from "@/lib/viewmodels/home";

/* ── Types ─────────────────────────────────────────────── */

type Props = { hero: HomeHeroVM; kpis: HomeKpiItem[] };

type ChartState = {
  w: number;
  h: number;
  primaryPath: string;
  baselinePath: string;
  stressPath: string;
  gridLines: number[];
  yScale: (v: number) => number;
  xScale: (v: number) => number;
};

/* ── Helpers ───────────────────────────────────────────── */

function getModeById(modes: HomeSignalMode[], id: HomeSignalModeId) {
  return modes.find((m) => m.id === id) ?? modes[0];
}

function buildChart(mode: HomeSignalMode): ChartState {
  const w = 920;
  const h = 240;
  const all = [...mode.primarySeries, ...mode.secondarySeries, ...mode.tertiarySeries];
  const lo = Math.min(...all) - 2;
  const hi = Math.max(...all) + 2;

  const xScale = scaleLinear()
    .domain([0, mode.primarySeries.length - 1])
    .range([0, w]);
  const yScale = scaleLinear().domain([lo, hi]).range([h - 12, 12]);

  const gen = line<number>()
    .x((_, i) => xScale(i))
    .y((v) => yScale(v));

  return {
    w,
    h,
    primaryPath: gen(mode.primarySeries) ?? "",
    baselinePath: gen(mode.secondarySeries) ?? "",
    stressPath: gen(mode.tertiarySeries) ?? "",
    gridLines: [0.2, 0.4, 0.6, 0.8].map((t) => 12 + t * (h - 24)),
    yScale,
    xScale,
  };
}

/* ── Fade helper ───────────────────────────────────────── */

function fade(reduced: boolean | null, delay: number) {
  if (reduced) return {};
  return {
    initial: { opacity: 0, y: 16 } as const,
    animate: { opacity: 1, y: 0 } as const,
    transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] } as const,
  };
}

/* ── Component ─────────────────────────────────────────── */

export function HomeHeroSignalWall({ hero, kpis }: Props) {
  const rm = useReducedMotion();
  const [modeId, setModeId] = useState<HomeSignalModeId>(hero.modes[0]?.id ?? "decision");
  const mode = getModeById(hero.modes, modeId);
  const c = useMemo(() => buildChart(mode), [mode]);

  /* Y-axis tick values — 5 evenly spaced from domain */
  const all = [...mode.primarySeries, ...mode.secondarySeries, ...mode.tertiarySeries];
  const lo = Math.min(...all) - 2;
  const hi = Math.max(...all) + 2;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(lo + t * (hi - lo)));

  return (
    <section className="relative -mx-5 px-5 pt-24 sm:-mx-7 sm:px-7 md:pt-32 lg:-mx-10 lg:px-10 lg:pt-36">
      <div className="relative mx-auto w-full max-w-[1000px]">

        {/* ── Task 6: Eyebrow ──────────────────────────── */}
        <motion.p
          className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500"
          {...fade(rm, 0.1)}
        >
          {hero.eyebrow}
        </motion.p>

        {/* ── Task 7: Headline ─────────────────────────── */}
        <motion.h1
          className="max-w-[860px] font-display text-[clamp(2.6rem,5.5vw,4.8rem)] leading-none tracking-[-0.035em] text-white"
          {...fade(rm, 0.2)}
        >
          {hero.headline}
        </motion.h1>

        {/* ── Task 8: Subheadline ──────────────────────── */}
        <motion.p
          className="mt-6 max-w-[640px] text-[16px] leading-relaxed text-slate-400 sm:text-[18px]"
          {...fade(rm, 0.3)}
        >
          {hero.subhead}
        </motion.p>

        {/* ── Tasks 9-10: CTAs ─────────────────────────── */}
        <motion.div className="mt-10 flex items-center gap-4" {...fade(rm, 0.4)}>
          <Link href={hero.ctaPrimary.href} className="cta-primary">
            {hero.ctaPrimary.label}
          </Link>
          <Link href={hero.ctaSecondary.href} className="cta-secondary">
            {hero.ctaSecondary.label}
          </Link>
        </motion.div>

        {/* ── Tasks 11-16: Signal Chart ────────────────── */}
        <motion.div className="mt-16" {...fade(rm, 0.5)}>
          {/* Task 16: Mode pills — minimal underline text links */}
          <div className="mb-4 flex items-center gap-4">
            {hero.modes.map((item) => {
              const active = item.id === modeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setModeId(item.id)}
                  className={`font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-200 ${active
                    ? "text-white"
                    : "text-slate-600 hover:text-slate-400"
                    }`}
                  aria-pressed={active}
                >
                  {active && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white align-middle" />}
                  {item.label}
                </button>
              );
            })}
            <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 sm:inline">
              {mode.scenario}
            </span>
          </div>

          {/* Task 11: Chart container — subtle border, near-transparent bg */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] px-4 py-5 sm:px-6">

            {/* The SVG chart */}
            <svg
              viewBox={`-40 0 ${c.w + 60} ${c.h}`}
              className="h-[220px] w-full sm:h-[280px]"
              preserveAspectRatio="none"
              role="img"
              aria-label={`${mode.label}: ${mode.description}`}
            >
              <defs>
                <filter id="primary-glow">
                  <feGaussianBlur stdDeviation="5" />
                </filter>
              </defs>

              {/* Task 12: Horizontal grid lines — barely visible */}
              {c.gridLines.map((y, i) => (
                <line
                  key={i}
                  x1={0}
                  x2={c.w}
                  y1={y}
                  y2={y}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth={1}
                />
              ))}

              {/* Y-axis tick labels */}
              {yTicks.map((val) => (
                <text
                  key={val}
                  x={-8}
                  y={c.yScale(val)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.15)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                >
                  {val}
                </text>
              ))}

              {/* Task 13: Primary glow underlayer */}
              <motion.path
                d={c.primaryPath}
                fill="none"
                stroke="rgba(140,160,240,0.35)"
                strokeWidth={7}
                strokeLinecap="round"
                filter="url(#primary-glow)"
                initial={rm ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: rm ? 0 : 1.2, delay: rm ? 0 : 0.6 }}
              />

              {/* Task 14: Stress line — desaturated red, thin */}
              <motion.path
                d={c.stressPath}
                fill="none"
                stroke="rgba(200,80,100,0.4)"
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={rm ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: rm ? 0 : 1.0, delay: rm ? 0 : 0.8 }}
              />

              {/* Task 14: Baseline line — desaturated teal, thin */}
              <motion.path
                d={c.baselinePath}
                fill="none"
                stroke="rgba(60,190,170,0.4)"
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={rm ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: rm ? 0 : 1.0, delay: rm ? 0 : 0.8 }}
              />

              {/* Task 13: Primary line — confident, surgical blue-slate */}
              <motion.path
                d={c.primaryPath}
                fill="none"
                stroke="rgba(140,160,240,0.9)"
                strokeWidth={2.5}
                strokeLinecap="round"
                initial={rm ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: rm ? 0 : 1.2, delay: rm ? 0 : 0.6 }}
              />

              {/* X-axis label */}
              <text
                x={c.w / 2}
                y={c.h - 1}
                textAnchor="middle"
                fill="rgba(255,255,255,0.12)"
                fontSize="9"
                fontFamily="var(--font-mono)"
                textDecoration="none"
              >
                {mode.xAxisLabel.toUpperCase()}
              </text>
            </svg>

            {/* Task 15: Legend — simple colored dashes + mono labels */}
            <div className="mt-3 flex items-center gap-6">
              <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-[2px] w-4 rounded-full bg-[rgba(140,160,240,0.9)]" aria-hidden="true" />
                Policy
              </span>
              <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-[2px] w-4 rounded-full bg-[rgba(60,190,170,0.4)]" aria-hidden="true" />
                Baseline
              </span>
              <span className="inline-flex items-center gap-2 text-[11px] text-slate-500">
                <span className="h-[2px] w-4 rounded-full bg-[rgba(200,80,100,0.4)]" aria-hidden="true" />
                Stress
              </span>
              <span className="ml-auto hidden text-[10px] text-slate-600 sm:inline">
                {mode.unit}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Tasks 17-19: KPI Ribbon ──────────────────── */}
        <motion.div
          className="mt-10 grid grid-cols-1 divide-y divide-white/[0.04] border-y border-white/[0.06] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          {...fade(rm, 0.7)}
        >
          {kpis.map((item) => (
            <div key={item.label} className="px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500">
                {item.label}
              </p>
              <div className="mt-2 text-[28px] font-bold tabular-nums leading-none text-white">
                <MetricCount value={Number(item.value)} pad={2} durationMs={1200} />
              </div>
              <p className="mt-2 line-clamp-1 text-[12px] leading-5 text-slate-500">
                {item.hint}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
