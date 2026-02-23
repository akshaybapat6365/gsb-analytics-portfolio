"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { line, scaleLinear } from "d3";
import { motion, useReducedMotion } from "framer-motion";
import { KpiCard } from "@/components/ui/KpiCard";
import type {
  HomeHeroVM,
  HomeKpiItem,
  HomeSignalMode,
  HomeSignalModeId,
} from "@/lib/viewmodels/home";

type HomeHeroSignalWallProps = {
  hero: HomeHeroVM;
  kpis: HomeKpiItem[];
};

type ChartState = {
  width: number;
  height: number;
  x: (value: number) => number;
  y: (value: number) => number;
  primaryPath: string;
  baselinePath: string;
  stressPath: string;
  tickIndexes: number[];
};

function getModeById(modes: HomeSignalMode[], id: HomeSignalModeId) {
  return modes.find((mode) => mode.id === id) ?? modes[0];
}

function buildChartState(mode: HomeSignalMode): ChartState {
  const width = 980;
  const height = 280;
  const points = [...mode.primarySeries, ...mode.secondarySeries, ...mode.tertiarySeries];
  const domainMin = Math.min(...points) - 1.5;
  const domainMax = Math.max(...points) + 1.5;

  const x = scaleLinear().domain([0, Math.max(1, mode.primarySeries.length - 1)]).range([46, width - 42]);
  const y = scaleLinear().domain([domainMin, domainMax]).range([height - 34, 24]);

  const drawLine = line<number>()
    .x((_, idx) => x(idx))
    .y((value) => y(value));

  const ticks = new Set([0, 2, 4, 6, 8, mode.primarySeries.length - 1]);

  return {
    width,
    height,
    x,
    y,
    primaryPath: drawLine(mode.primarySeries) ?? "",
    baselinePath: drawLine(mode.secondarySeries) ?? "",
    stressPath: drawLine(mode.tertiarySeries) ?? "",
    tickIndexes: [...ticks].sort((a, b) => a - b),
  };
}

const kpiAccents: Array<"amber" | "crimson" | "emerald"> = ["amber", "crimson", "emerald"];

export function HomeHeroSignalWall({ hero, kpis }: HomeHeroSignalWallProps) {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<HomeSignalModeId>(hero.modes[0]?.id ?? "decision");
  const payload = getModeById(hero.modes, mode);
  const chart = useMemo(() => buildChartState(payload), [payload]);

  const annotationX = chart.x(payload.annotationIndex);
  const annotationY = chart.y(payload.primarySeries[payload.annotationIndex] ?? 0);
  const annotationLabelX = Math.max(40, Math.min(chart.width - 276, annotationX + 16));
  const annotationLabelY = Math.max(24, annotationY - 46);
  const annotationSnippet =
    payload.annotationDetail.length > 44
      ? `${payload.annotationDetail.slice(0, 41)}…`
      : payload.annotationDetail;

  return (
    <section className="home-hero relative -mx-5 overflow-hidden border-b border-white/10 px-5 py-14 sm:-mx-7 sm:px-7 sm:py-16 lg:-mx-10 lg:px-10 lg:py-20">
      <div className="hero-orb-1" aria-hidden="true" />
      <div className="hero-orb-2" aria-hidden="true" />
      <div className="hero-orb-3" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1280px]">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300 sm:text-[13px]"
          initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.2 }}
        >
          {hero.eyebrow}
        </motion.p>

        <motion.h1
          className="mt-4 max-w-[980px] font-display text-[clamp(3rem,6vw,5.5rem)] leading-[0.96] tracking-[-0.035em] text-[rgb(240,236,226)]"
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.35 }}
        >
          {hero.headline}
        </motion.h1>

        <motion.p
          className="mt-5 max-w-[760px] text-[16px] leading-8 text-[rgba(220,215,205,0.78)] sm:text-[19px]"
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.5 }}
        >
          {hero.subhead}
        </motion.p>

        <motion.div
          className="mt-7 flex flex-wrap items-center gap-3"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, delay: reduceMotion ? 0 : 0.65 }}
        >
          <Link href={hero.ctaPrimary.href} className="cta-primary">
            {hero.ctaPrimary.label}
          </Link>
          <Link href={hero.ctaSecondary.href} className="cta-secondary">
            {hero.ctaSecondary.label}
          </Link>
        </motion.div>

        <motion.div
          className="mt-11"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.8 }}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {hero.modes.map((item) => {
                const active = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={
                      active
                        ? "signal-pill signal-pill--active"
                        : "signal-pill"
                    }
                    aria-pressed={active}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300 sm:text-[12px]">
              {payload.scenario}
            </p>
          </div>

          <figure className="home-signal-board">
            <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-auto w-full" role="img" aria-label={`${payload.label} chart`}>
              <defs>
                <filter id="signal-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>

              {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                <line
                  key={`h-${tick}`}
                  x1={46}
                  x2={chart.width - 42}
                  y1={24 + tick * (chart.height - 58)}
                  y2={24 + tick * (chart.height - 58)}
                  stroke="rgba(156,167,191,0.16)"
                  strokeDasharray="4 10"
                />
              ))}

              {chart.tickIndexes.map((idx) => (
                <line
                  key={`v-${idx}`}
                  x1={chart.x(idx)}
                  x2={chart.x(idx)}
                  y1={24}
                  y2={chart.height - 34}
                  stroke="rgba(156,167,191,0.14)"
                  strokeDasharray="4 10"
                />
              ))}

              <line
                x1={annotationX}
                x2={annotationX}
                y1={22}
                y2={chart.height - 34}
                stroke="rgba(233,228,246,0.58)"
                strokeDasharray="7 8"
              />

              <motion.path
                d={chart.primaryPath}
                fill="none"
                stroke="rgba(180,160,240,0.6)"
                strokeWidth={8}
                filter="url(#signal-glow)"
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.22 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.22 } : { pathLength: 1, opacity: 0.36 }}
                transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 0.85, ease: "easeOut" }}
              />

              <motion.path
                d={chart.stressPath}
                fill="none"
                stroke="rgba(240,100,100,0.8)"
                strokeWidth={2.8}
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.5 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.8 } : { pathLength: 1, opacity: 0.8 }}
                transition={{ duration: reduceMotion ? 0 : 1.3, delay: reduceMotion ? 0 : 0.9, ease: "easeOut" }}
              />
              <motion.path
                d={chart.baselinePath}
                fill="none"
                stroke="rgba(80,200,170,0.86)"
                strokeWidth={2.8}
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.5 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.86 } : { pathLength: 1, opacity: 0.86 }}
                transition={{ duration: reduceMotion ? 0 : 1.3, delay: reduceMotion ? 0 : 0.95, ease: "easeOut" }}
              />
              <motion.path
                d={chart.primaryPath}
                fill="none"
                stroke="rgba(180,160,240,0.98)"
                strokeWidth={3.8}
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.55 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.98 } : { pathLength: 1, opacity: 0.98 }}
                transition={{ duration: reduceMotion ? 0 : 1.5, delay: reduceMotion ? 0 : 0.85, ease: "easeOut" }}
              />

              {payload.primarySeries.map((value, index) => (
                <circle
                  key={`primary-point-${index}`}
                  cx={chart.x(index)}
                  cy={chart.y(value)}
                  r={3.1}
                  className="home-signal-point"
                />
              ))}

              <circle cx={annotationX} cy={annotationY} r={4.8} fill="rgba(230,222,248,0.96)" />

              <g transform={`translate(${annotationLabelX}, ${annotationLabelY})`}>
                <rect x={0} y={0} width={230} height={42} rx={8} fill="rgba(15,17,26,0.9)" stroke="rgba(180,160,240,0.6)" />
                <text x={12} y={16} fill="rgba(230,222,248,0.98)" fontSize="12" fontFamily="var(--font-mono)" letterSpacing="0.08em">
                  {payload.annotationTitle}
                </text>
                <text x={12} y={31} fill="rgba(202,205,220,0.95)" fontSize="12" fontFamily="var(--font-sans)">
                  {annotationSnippet}
                </text>
              </g>

              <text
                x={chart.width - 46}
                y={chart.y(payload.primarySeries[payload.primarySeries.length - 1] ?? 0) - 10}
                textAnchor="end"
                fill="rgba(180,160,240,0.98)"
                fontSize="13"
                fontFamily="var(--font-mono)"
              >
                Policy
              </text>
              <text
                x={chart.width - 46}
                y={chart.y(payload.secondarySeries[payload.secondarySeries.length - 1] ?? 0) - 10}
                textAnchor="end"
                fill="rgba(80,200,170,0.9)"
                fontSize="13"
                fontFamily="var(--font-mono)"
              >
                Baseline
              </text>
              <text
                x={chart.width - 46}
                y={chart.y(payload.tertiarySeries[payload.tertiarySeries.length - 1] ?? 0) + 14}
                textAnchor="end"
                fill="rgba(240,100,100,0.88)"
                fontSize="13"
                fontFamily="var(--font-mono)"
              >
                Stress
              </text>

              <text x={46} y={chart.height - 8} fill="rgba(170,178,198,0.88)" fontSize="11" fontFamily="var(--font-mono)" letterSpacing="0.1em">
                X: {payload.xAxisLabel.toUpperCase()}
              </text>
              <text
                x={chart.width - 42}
                y={chart.height - 8}
                textAnchor="end"
                fill="rgba(170,178,198,0.88)"
                fontSize="11"
                fontFamily="var(--font-mono)"
                letterSpacing="0.1em"
              >
                Y: {`${payload.axisLabel} · ${payload.unit}`.toUpperCase()}
              </text>
            </svg>

            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[13px] leading-6 text-slate-300">
              <span>{payload.description}</span>
              <span className="font-mono uppercase tracking-[0.12em] text-slate-400">Live signal sample</span>
            </figcaption>
          </figure>
        </motion.div>

        <motion.div
          className="home-kpi-ribbon mt-8 grid gap-0 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] sm:grid-cols-3"
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 1 }}
        >
          {kpis.map((item, index) => (
            <div
              key={item.label}
              className={index < kpis.length - 1 ? "border-b border-white/12 sm:border-b-0 sm:border-r" : ""}
            >
              <KpiCard
                label={item.label}
                value={item.value}
                hint={item.hint}
                accent={kpiAccents[index] ?? "amber"}
                countValue={Number(item.value)}
                countPad={2}
                variant="hero-ribbon"
                className="border-0 bg-transparent shadow-none"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
