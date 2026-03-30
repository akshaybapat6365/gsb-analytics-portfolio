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
    <section className="relative -mx-5 overflow-hidden px-5 pb-4 pt-16 sm:-mx-7 sm:px-7 sm:pt-20 lg:-mx-10 lg:px-10 lg:pt-24">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_48%),radial-gradient(circle_at_18%_22%,rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,rgba(4,10,20,0.7),rgba(4,10,20,0))]"
      />
      <div className="relative mx-auto w-full max-w-[1180px] rounded-[34px] border border-sky-300/12 bg-[linear-gradient(180deg,rgba(7,12,22,0.92),rgba(5,10,18,0.82))] px-6 py-8 shadow-[0_30px_120px_rgba(2,12,24,0.42)] backdrop-blur-sm sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/80 to-transparent" aria-hidden="true" />

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-16">
          <div className="min-w-0">
            <motion.div
              className="inline-flex items-center gap-3 rounded-full border border-sky-300/18 bg-sky-300/[0.07] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-sky-100/80 sm:text-[11px]"
              {...fade(rm, 0.08)}
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_16px_rgba(125,211,252,0.85)]" />
              {hero.eyebrow}
            </motion.div>

            <motion.h1
              className="mt-7 max-w-[11ch] text-balance font-display text-[clamp(3.65rem,10vw,6.5rem)] leading-[0.92] tracking-[-0.05em] text-white"
              {...fade(rm, 0.16)}
            >
              <span className="bg-[linear-gradient(135deg,#ffffff_18%,#d9f5ff_52%,#7dd3fc_92%)] bg-clip-text text-transparent">
                {hero.headline}
              </span>
            </motion.h1>

            <motion.p
              className="mt-7 max-w-[44rem] text-[18px] leading-[1.8] text-slate-200 sm:text-[19px]"
              {...fade(rm, 0.24)}
            >
              {hero.subhead}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-sky-100/65 sm:gap-4"
              {...fade(rm, 0.3)}
            >
              <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono">Pricing</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono">Fraud</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono">Operations</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono">Geo Strategy</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono">Infrastructure</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono">Content</span>
            </motion.div>

            <motion.div className="mt-10 flex flex-wrap items-center gap-4" {...fade(rm, 0.36)}>
              <Link href={hero.ctaPrimary.href} className="cta-primary shadow-[0_18px_48px_rgba(125,211,252,0.2)]">
                {hero.ctaPrimary.label}
              </Link>
              <Link href={hero.ctaSecondary.href} className="cta-secondary bg-white/[0.03]">
                {hero.ctaSecondary.label}
              </Link>
            </motion.div>
          </div>

          <motion.div className="mt-2 lg:mt-0" {...fade(rm, 0.42)}>
            <div className="rounded-[28px] border border-sky-300/12 bg-[linear-gradient(180deg,rgba(10,18,30,0.95),rgba(7,12,22,0.94))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sky-100/55">
                    Live decision canvas
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">
                    A single accent-led signal wall tracks scenario posture, downside pressure, and allocation efficiency without the dashboard clutter.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {hero.modes.map((item) => {
                    const active = item.id === modeId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setModeId(item.id)}
                        className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-200 ${active
                          ? "border-sky-200/40 bg-sky-300/10 text-sky-50"
                          : "border-white/8 text-slate-500 hover:border-sky-200/20 hover:text-slate-200"
                          }`}
                        aria-pressed={active}
                      >
                        {active && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-sky-300 align-middle" />}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] px-4 py-5 sm:px-6">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-sky-100/48">
                  {mode.axisLabel} ({mode.unit})
                </p>

                <svg
                  viewBox={`-40 0 ${c.w + 130} ${c.h + 16}`}
                  className="h-[200px] w-full sm:h-[260px]"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label={`${mode.label}: ${mode.description}`}
                >
                <defs>
                  <filter id="primary-glow">
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                  <linearGradient id="hero-primary-line" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(125,211,252,0.64)" />
                    <stop offset="50%" stopColor="rgba(147,197,253,0.92)" />
                    <stop offset="100%" stopColor="rgba(186,230,253,0.98)" />
                  </linearGradient>
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
                  stroke="rgba(125,211,252,0.34)"
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
                  stroke="rgba(125,211,252,0.3)"
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
                  stroke="rgba(125,211,252,0.2)"
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
                  stroke="url(#hero-primary-line)"
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
                <circle cx={annX} cy={annY} r={4} fill="rgba(125,211,252,0.92)" stroke="rgba(10,10,14,1)" strokeWidth={2} />
                {/* Annotation label — positioned well above line to avoid overlap */}
                <text
                  x={annX + 10}
                  y={Math.min(annY - 40, c.h * 0.15)}
                  fill="rgba(224,242,254,0.82)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight="500"
                >
                  {mode.annotationTitle}
                </text>
                <text
                  x={annX + 10}
                  y={Math.min(annY - 28, c.h * 0.15 + 12)}
                  fill="rgba(224,242,254,0.38)"
                  fontSize="8"
                  fontFamily="var(--font-mono)"
                >
                  {mode.annotationDetail.substring(0, 42)}
                </text>
                {/* Thin connector line from label to dot */}
                <line
                  x1={annX + 8}
                  y1={Math.min(annY - 26, c.h * 0.15 + 14)}
                  x2={annX}
                  y2={annY - 5}
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.5}
                />

                {/* ── Direct endpoint labels on lines ── */}
                <text x={c.primaryEnd[0] + 8} y={c.primaryEnd[1] + 1} fill="rgba(224,242,254,0.82)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="500" dominantBaseline="middle">
                  Policy
                </text>
                <text x={c.baselineEnd[0] + 8} y={c.baselineEnd[1] + 1} fill="rgba(224,242,254,0.55)" fontSize="10" fontFamily="var(--font-mono)" dominantBaseline="middle">
                  Baseline
                </text>
                <text x={c.stressEnd[0] + 8} y={c.stressEnd[1] + 1} fill="rgba(224,242,254,0.42)" fontSize="10" fontFamily="var(--font-mono)" dominantBaseline="middle">
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

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-sky-100/48">
                  {mode.scenario} · {mode.unit}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 grid gap-4 border-t border-white/6 pt-8 sm:grid-cols-3 sm:gap-5 sm:pt-10"
          {...fade(rm, 0.7)}
        >
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-[22px] border border-sky-300/10 bg-white/[0.025] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sky-100/52">
                {item.label}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-[44px] font-bold tabular-nums leading-none tracking-[-0.04em] text-white">
                  <MetricCount value={Number(item.value)} pad={2} durationMs={1200} />
                </span>
              </div>
              <p className="mt-3 max-w-[26ch] text-[13px] leading-6 text-slate-400">
                {item.hint}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
