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
  /* endpoint positions for direct labels */
  primaryEnd: [number, number];
  baselineEnd: [number, number];
  stressEnd: [number, number];
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

  const lastIdx = mode.primarySeries.length - 1;

  return {
    w,
    h,
    primaryPath: gen(mode.primarySeries) ?? "",
    baselinePath: gen(mode.secondarySeries) ?? "",
    stressPath: gen(mode.tertiarySeries) ?? "",
    gridLines: [0.2, 0.4, 0.6, 0.8].map((t) => 12 + t * (h - 24)),
    yScale,
    xScale,
    primaryEnd: [xScale(lastIdx), yScale(mode.primarySeries[lastIdx])],
    baselineEnd: [xScale(lastIdx), yScale(mode.secondarySeries[lastIdx])],
    stressEnd: [xScale(lastIdx), yScale(mode.tertiarySeries[lastIdx])],
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

  /* Y-axis tick values */
  const all = [...mode.primarySeries, ...mode.secondarySeries, ...mode.tertiarySeries];
  const lo = Math.min(...all) - 2;
  const hi = Math.max(...all) + 2;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(lo + t * (hi - lo)));

  /* Annotation position */
  const annIdx = mode.annotationIndex;
  const annX = c.xScale(annIdx);
  const annY = c.yScale(mode.primarySeries[annIdx]);

  return (
    <section className="relative -mx-5 px-5 pt-20 sm:-mx-7 sm:px-7 md:pt-28 lg:-mx-10 lg:px-10 lg:pt-32">
      <div className="relative mx-auto w-full max-w-[1100px]">

        {/* ── 2-Column Hero Layout ──────────────────── */}
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">

          {/* Left Column: Identity + CTAs */}
          <div>
            {/* Eyebrow */}
            <motion.p
              className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500"
              {...fade(rm, 0.1)}
            >
              {hero.eyebrow}
            </motion.p>

            {/* Headline */}
            <motion.h1
              className="font-display text-[clamp(2.8rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.03em] text-white"
              {...fade(rm, 0.2)}
            >
              {hero.headline}
            </motion.h1>

            {/* Subhead — larger, higher contrast, concrete */}
            <motion.p
              className="mt-6 max-w-[52ch] text-[17px] leading-[1.65] text-slate-300"
              {...fade(rm, 0.3)}
            >
              {hero.subhead}
            </motion.p>

            {/* Proof line */}
            <motion.p
              className="mt-4 font-mono text-[12px] leading-relaxed tracking-wide text-slate-500"
              {...fade(rm, 0.35)}
            >
              Pricing · Fraud · Retail Ops · Geospatial · Infrastructure · Content — all evidence-tagged
            </motion.p>

            {/* CTAs */}
            <motion.div className="mt-8 flex items-center gap-4" {...fade(rm, 0.4)}>
              <Link href={hero.ctaPrimary.href} className="cta-primary">
                {hero.ctaPrimary.label}
              </Link>
              <Link href={hero.ctaSecondary.href} className="cta-secondary">
                {hero.ctaSecondary.label}
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Signal Chart */}
          <motion.div className="mt-4 lg:mt-0" {...fade(rm, 0.5)}>
            {/* Mode pills */}
            <div className="mb-3 flex items-center gap-4">
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
            </div>

            {/* Chart container */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] px-4 py-5 sm:px-6">

              {/* Y-axis label */}
              <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                {mode.axisLabel} ({mode.unit})
              </p>

              <svg
                viewBox={`-40 0 ${c.w + 100} ${c.h + 16}`}
                className="h-[200px] w-full sm:h-[260px]"
                preserveAspectRatio="none"
                role="img"
                aria-label={`${mode.label}: ${mode.description}`}
              >
                <defs>
                  <filter id="primary-glow">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                </defs>

                {/* Grid lines */}
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
                    fill="rgba(255,255,255,0.18)"
                    fontSize="9"
                    fontFamily="var(--font-mono)"
                  >
                    {val}
                  </text>
                ))}

                {/* Primary glow underlayer */}
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

                {/* Stress line */}
                <motion.path
                  d={c.stressPath}
                  fill="none"
                  stroke="rgba(200,80,100,0.45)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  initial={rm ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: rm ? 0 : 1.0, delay: rm ? 0 : 0.8 }}
                />

                {/* Baseline line */}
                <motion.path
                  d={c.baselinePath}
                  fill="none"
                  stroke="rgba(60,190,170,0.45)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  initial={rm ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: rm ? 0 : 1.0, delay: rm ? 0 : 0.8 }}
                />

                {/* Primary line */}
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

                {/* ── Annotation callout at decision moment ── */}
                <line
                  x1={annX}
                  x2={annX}
                  y1={12}
                  y2={c.h - 12}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                  strokeDasharray="4 3"
                />
                <circle cx={annX} cy={annY} r={4} fill="rgba(140,160,240,0.9)" stroke="rgba(10,10,14,1)" strokeWidth={2} />
                <text
                  x={annX + 8}
                  y={Math.max(annY - 14, 20)}
                  fill="rgba(255,255,255,0.7)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                  fontWeight="500"
                >
                  {mode.annotationTitle}
                </text>
                <text
                  x={annX + 8}
                  y={Math.max(annY - 2, 33)}
                  fill="rgba(255,255,255,0.35)"
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                >
                  {mode.annotationDetail.substring(0, 50)}
                </text>

                {/* ── Direct endpoint labels on lines ── */}
                <text x={c.primaryEnd[0] + 8} y={c.primaryEnd[1] + 1} fill="rgba(140,160,240,0.8)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="500" dominantBaseline="middle">
                  Policy
                </text>
                <text x={c.baselineEnd[0] + 8} y={c.baselineEnd[1] + 1} fill="rgba(60,190,170,0.6)" fontSize="10" fontFamily="var(--font-mono)" dominantBaseline="middle">
                  Baseline
                </text>
                <text x={c.stressEnd[0] + 8} y={c.stressEnd[1] + 1} fill="rgba(200,80,100,0.6)" fontSize="10" fontFamily="var(--font-mono)" dominantBaseline="middle">
                  Stress
                </text>

                {/* X-axis label */}
                <text
                  x={c.w / 2}
                  y={c.h + 12}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.15)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                >
                  {mode.xAxisLabel.toUpperCase()}
                </text>
              </svg>

              {/* Scenario context */}
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600">
                {mode.scenario} · {mode.unit}
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── KPI Proof Strip — Editorial Layout ─────── */}
        <motion.div
          className="mt-16 flex flex-col gap-8 sm:mt-20 sm:flex-row sm:items-baseline sm:gap-16"
          {...fade(rm, 0.7)}
        >
          {kpis.map((item) => (
            <div key={item.label} className="flex items-baseline gap-3">
              <span className="text-[40px] font-bold tabular-nums leading-none tracking-tight text-white">
                <MetricCount value={Number(item.value)} pad={2} durationMs={1200} />
              </span>
              <div>
                <p className="text-[14px] font-medium text-slate-300">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-slate-500">
                  {item.hint}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
