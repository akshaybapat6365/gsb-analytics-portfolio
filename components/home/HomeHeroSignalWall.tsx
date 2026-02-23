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
  primaryPath: string;
  baselinePath: string;
  stressPath: string;
  gridY: number[];
};

function getModeById(modes: HomeSignalMode[], id: HomeSignalModeId) {
  return modes.find((mode) => mode.id === id) ?? modes[0];
}

function buildChartState(mode: HomeSignalMode): ChartState {
  const width = 980;
  const height = 260;
  const points = [...mode.primarySeries, ...mode.secondarySeries, ...mode.tertiarySeries];
  const domainMin = Math.min(...points) - 1.5;
  const domainMax = Math.max(...points) + 1.5;

  const x = scaleLinear().domain([0, Math.max(1, mode.primarySeries.length - 1)]).range([26, width - 26]);
  const y = scaleLinear().domain([domainMin, domainMax]).range([height - 26, 24]);

  const drawLine = line<number>()
    .x((_, idx) => x(idx))
    .y((value) => y(value));

  return {
    width,
    height,
    primaryPath: drawLine(mode.primarySeries) ?? "",
    baselinePath: drawLine(mode.secondarySeries) ?? "",
    stressPath: drawLine(mode.tertiarySeries) ?? "",
    gridY: [0.05, 0.25, 0.45, 0.65, 0.85].map((step) => 24 + step * (height - 50)),
  };
}

const kpiAccents: Array<"amber" | "crimson" | "emerald"> = ["amber", "crimson", "emerald"];

export function HomeHeroSignalWall({ hero, kpis }: HomeHeroSignalWallProps) {
  const reduceMotion = useReducedMotion();
  const [mode, setMode] = useState<HomeSignalModeId>(hero.modes[0]?.id ?? "decision");
  const payload = getModeById(hero.modes, mode);
  const chart = useMemo(() => buildChartState(payload), [payload]);

  return (
    <section className="home-hero relative -mx-5 overflow-hidden border-b border-white/10 px-5 pt-20 pb-16 sm:-mx-7 sm:px-7 sm:pt-28 sm:pb-20 lg:-mx-10 lg:px-10 lg:pt-36 lg:pb-24">
      <div className="hero-orb-1" aria-hidden="true" />
      <div className="hero-orb-2" aria-hidden="true" />
      <div className="hero-orb-3" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1280px]">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500 sm:text-[13px]"
          initial={reduceMotion ? undefined : { opacity: 0, x: -20 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.2 }}
        >
          {hero.eyebrow}
        </motion.p>

        <motion.h1
          className="mt-4 max-w-2xl font-display text-[clamp(2.8rem,5.5vw,5rem)] leading-[1.0] tracking-[-0.03em] text-white"
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.35 }}
        >
          {hero.headline}
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-[17px] leading-8 text-slate-400"
          initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.5 }}
        >
          {hero.subhead}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-3"
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
          className="mt-16"
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.8 }}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {hero.modes.map((item) => {
                const active = item.id === mode;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={active ? "signal-pill signal-pill--active" : "signal-pill"}
                    aria-pressed={active}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500 sm:text-[12px]">
              {payload.scenario}
            </p>
          </div>

          <figure className="home-signal-board">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="h-auto w-full"
              role="img"
              aria-label={`${payload.label} chart`}
            >
              <defs>
                <filter id="signal-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>

              {chart.gridY.map((yPos, index) => (
                <line
                  key={`h-${index}`}
                  x1={26}
                  x2={chart.width - 26}
                  y1={yPos}
                  y2={yPos}
                  stroke="rgba(156,167,191,0.03)"
                />
              ))}

              <motion.path
                d={chart.primaryPath}
                fill="none"
                stroke="rgba(180,160,240,0.4)"
                strokeWidth={8}
                filter="url(#signal-glow)"
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.2 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.2 } : { pathLength: 1, opacity: 0.34 }}
                transition={{ duration: reduceMotion ? 0 : 1.45, delay: reduceMotion ? 0 : 0.88, ease: "easeOut" }}
              />

              <motion.path
                d={chart.stressPath}
                fill="none"
                stroke="rgba(240,100,100,0.78)"
                strokeWidth={2.2}
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.45 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.78 } : { pathLength: 1, opacity: 0.78 }}
                transition={{ duration: reduceMotion ? 0 : 1.3, delay: reduceMotion ? 0 : 0.92, ease: "easeOut" }}
              />
              <motion.path
                d={chart.baselinePath}
                fill="none"
                stroke="rgba(80,200,170,0.8)"
                strokeWidth={2.2}
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.45 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.8 } : { pathLength: 1, opacity: 0.8 }}
                transition={{ duration: reduceMotion ? 0 : 1.3, delay: reduceMotion ? 0 : 0.96, ease: "easeOut" }}
              />
              <motion.path
                d={chart.primaryPath}
                fill="none"
                stroke="rgba(180,160,240,0.95)"
                strokeWidth={3.2}
                strokeLinecap="round"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0.5 }}
                animate={reduceMotion ? { pathLength: 1, opacity: 0.95 } : { pathLength: 1, opacity: 0.95 }}
                transition={{ duration: reduceMotion ? 0 : 1.45, delay: reduceMotion ? 0 : 0.88, ease: "easeOut" }}
              />
            </svg>

            <figcaption className="mt-4 flex flex-wrap items-center gap-5 text-[11px] uppercase tracking-[0.14em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-[2px] w-5 rounded bg-[rgba(180,160,240,0.95)]" aria-hidden="true" />
                Policy
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-[2px] w-5 rounded bg-[rgba(80,200,170,0.8)]" aria-hidden="true" />
                Baseline
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-[2px] w-5 rounded bg-[rgba(240,100,100,0.78)]" aria-hidden="true" />
                Stress
              </span>
            </figcaption>
          </figure>
        </motion.div>

        <motion.div
          className="home-kpi-ribbon mt-12 grid gap-0 overflow-hidden rounded-2xl border border-white/[0.05] bg-white/[0.02] sm:grid-cols-3"
          initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 1 }}
        >
          {kpis.map((item, index) => (
            <div
              key={item.label}
              className={index < kpis.length - 1 ? "border-b border-white/[0.06] sm:border-b-0 sm:border-r" : ""}
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
