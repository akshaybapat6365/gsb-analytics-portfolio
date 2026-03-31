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
        className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_38%),radial-gradient(circle_at_16%_18%,rgba(251,191,36,0.14),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(244,114,36,0.14),transparent_28%),linear-gradient(180deg,rgba(24,14,8,0.92),rgba(9,10,16,0))]"
      />
      <div className="absolute inset-x-0 top-24 h-[540px] bg-[radial-gradient(circle_at_center,rgba(120,53,15,0.16),transparent_56%)]" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[1180px] rounded-[38px] border border-white/10 bg-[linear-gradient(145deg,rgba(47,29,18,0.7),rgba(14,14,20,0.9)_36%,rgba(11,11,18,0.96)_100%)] px-6 py-8 shadow-[0_34px_140px_rgba(11,7,4,0.52)] backdrop-blur-xl sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-100/70 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-200/20 to-transparent" aria-hidden="true" />
        <div className="absolute inset-0 rounded-[38px] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_22%,transparent_78%,rgba(255,255,255,0.02))]" aria-hidden="true" />

        <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-16">
          <div className="min-w-0">
            <motion.div
              className="inline-flex items-center gap-3 rounded-full border border-amber-100/18 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(255,255,255,0.05))] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stone-100/80 sm:text-[11px]"
              {...fade(rm, 0.08)}
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.75)]" />
              {hero.eyebrow}
            </motion.div>

            <motion.h1
              className="mt-7 max-w-[11ch] text-balance font-display text-[clamp(3.65rem,10vw,6.5rem)] leading-[0.92] tracking-[-0.05em] text-white"
              {...fade(rm, 0.16)}
            >
              <span className="bg-[linear-gradient(135deg,#fff7ed_10%,#fde68a_38%,#fb923c_74%,#f8fafc_100%)] bg-clip-text text-transparent">
                {hero.headline}
              </span>
            </motion.h1>

            <motion.p
              className="mt-7 max-w-[44rem] text-[18px] leading-[1.8] text-stone-200/82 sm:text-[19px]"
              {...fade(rm, 0.24)}
            >
              {hero.subhead}
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-stone-200/58 sm:gap-4"
              {...fade(rm, 0.3)}
            >
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono">Pricing</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono">Fraud</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono">Operations</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono">Geo Strategy</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono">Infrastructure</span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono">Content</span>
            </motion.div>

            <motion.div className="mt-10 flex flex-wrap items-center gap-4" {...fade(rm, 0.36)}>
              <Link
                href={hero.ctaPrimary.href}
                className="cta-primary border-amber-100/30 bg-[linear-gradient(135deg,rgba(254,243,199,0.98),rgba(251,191,36,0.92))] text-stone-950 shadow-[0_20px_55px_rgba(245,158,11,0.24)]"
              >
                {hero.ctaPrimary.label}
              </Link>
              <Link
                href={hero.ctaSecondary.href}
                className="cta-secondary border-white/14 bg-white/[0.04] text-stone-100/86 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                {hero.ctaSecondary.label}
              </Link>
            </motion.div>
          </div>

          <motion.div className="mt-2 lg:mt-0" {...fade(rm, 0.42)}>
            <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(50,31,20,0.58),rgba(13,13,18,0.94))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-100/58">
                    Live decision canvas
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-stone-200/70">
                    A single signal wall tracks scenario posture, downside pressure, and allocation efficiency with a calmer, warmer visual rhythm.
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
                          ? "border-amber-100/34 bg-amber-200/[0.1] text-amber-50"
                          : "border-white/8 text-stone-400 hover:border-orange-200/18 hover:text-stone-200"
                          }`}
                        aria-pressed={active}
                      >
                        {active && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-amber-300 align-middle" />}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,248,240,0.055),rgba(255,255,255,0.012))] px-4 py-5 sm:px-6">
                <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.18em] text-stone-200/48">
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
                    <stop offset="0%" stopColor="rgba(251,191,36,0.56)" />
                    <stop offset="50%" stopColor="rgba(249,115,22,0.88)" />
                    <stop offset="100%" stopColor="rgba(254,243,199,0.96)" />
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
                  stroke="rgba(251,191,36,0.26)"
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
                  stroke="rgba(251,146,60,0.3)"
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
                  stroke="rgba(245,158,11,0.22)"
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
                <circle cx={annX} cy={annY} r={4} fill="rgba(251,191,36,0.92)" stroke="rgba(10,10,14,1)" strokeWidth={2} />
                {/* Annotation label — positioned well above line to avoid overlap */}
                <text
                  x={annX + 10}
                  y={Math.min(annY - 40, c.h * 0.15)}
                  fill="rgba(254,243,199,0.82)"
                  fontSize="9"
                  fontFamily="var(--font-mono)"
                  fontWeight="500"
                >
                  {mode.annotationTitle}
                </text>
                <text
                  x={annX + 10}
                  y={Math.min(annY - 28, c.h * 0.15 + 12)}
                  fill="rgba(255,237,213,0.42)"
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
                <text x={c.primaryEnd[0] + 8} y={c.primaryEnd[1] + 1} fill="rgba(254,243,199,0.82)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="500" dominantBaseline="middle">
                  Policy
                </text>
                <text x={c.baselineEnd[0] + 8} y={c.baselineEnd[1] + 1} fill="rgba(255,237,213,0.55)" fontSize="10" fontFamily="var(--font-mono)" dominantBaseline="middle">
                  Baseline
                </text>
                <text x={c.stressEnd[0] + 8} y={c.stressEnd[1] + 1} fill="rgba(255,237,213,0.38)" fontSize="10" fontFamily="var(--font-mono)" dominantBaseline="middle">
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

                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-stone-200/44">
                  {mode.scenario} · {mode.unit}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-12 grid gap-4 border-t border-white/8 pt-8 sm:grid-cols-3 sm:gap-5 sm:pt-10"
          {...fade(rm, 0.7)}
        >
          {kpis.map((item) => (
            <div
              key={item.label}
              className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,248,240,0.06),rgba(255,255,255,0.02))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-md"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-stone-200/54">
                {item.label}
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-[44px] font-bold tabular-nums leading-none tracking-[-0.04em] text-stone-50">
                  <MetricCount value={Number(item.value)} pad={2} durationMs={1200} />
                </span>
              </div>
              <p className="mt-3 max-w-[26ch] text-[13px] leading-6 text-stone-300/62">
                {item.hint}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
