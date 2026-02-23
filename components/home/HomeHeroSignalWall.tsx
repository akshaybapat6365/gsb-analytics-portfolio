"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { line, scaleLinear } from "d3";
import type { HomeHeroVM, HomeSignalMode, HomeSignalModeId } from "@/lib/viewmodels/home";

type HomeHeroSignalWallProps = {
  hero: HomeHeroVM;
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
  const width = 560;
  const height = 228;
  const points = [...mode.primarySeries, ...mode.secondarySeries, ...mode.tertiarySeries];
  const domainMin = Math.min(...points) - 1.5;
  const domainMax = Math.max(...points) + 1.5;

  const x = scaleLinear().domain([0, Math.max(1, mode.primarySeries.length - 1)]).range([0, width]);
  const y = scaleLinear().domain([domainMin, domainMax]).range([height - 16, 16]);

  const drawLine = line<number>()
    .x((_, idx) => x(idx))
    .y((value) => y(value));

  return {
    width,
    height,
    x,
    y,
    primaryPath: drawLine(mode.primarySeries) ?? "",
    baselinePath: drawLine(mode.secondarySeries) ?? "",
    stressPath: drawLine(mode.tertiarySeries) ?? "",
    tickIndexes: [0, 2, 4, 6, 8, mode.primarySeries.length - 1],
  };
}

export function HomeHeroSignalWall({ hero }: HomeHeroSignalWallProps) {
  const [mode, setMode] = useState<HomeSignalModeId>(hero.modes[0]?.id ?? "decision");
  const payload = getModeById(hero.modes, mode);
  const chart = useMemo(() => buildChartState(payload), [payload]);

  const annotationX = chart.x(payload.annotationIndex);
  const annotationY = chart.y(payload.primarySeries[payload.annotationIndex] ?? 0);

  return (
    <section className="surface-primary relative overflow-hidden p-5 sm:p-7 lg:p-8" data-home-hero>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(920px_560px_at_14%_0%,rgba(123,31,31,0.16),transparent_64%),radial-gradient(920px_560px_at_90%_0%,rgba(139,107,62,0.16),transparent_66%)]" />
      <div className="relative z-10">
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
          <div data-hero-copy className="space-y-4">
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-300">
              {hero.eyebrow}
            </p>
            <h1 className="max-w-4xl font-display text-[34px] leading-[1.01] text-slate-50 sm:text-[50px] lg:text-[62px]">
              {hero.headline}
            </h1>
            <p className="max-w-4xl text-[17px] leading-8 text-slate-100 sm:text-[19px]">
              {hero.identityLine}
            </p>
            <p className="max-w-3xl text-[15px] leading-7 text-slate-200 sm:text-[17px]">
              {hero.subhead}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={hero.ctaPrimary.href}
                className="inline-flex items-center justify-center rounded-full border border-amber-200/35 bg-amber-300 px-6 py-3 text-sm font-semibold text-slate-950 no-underline transition hover:no-underline hover:bg-amber-200"
              >
                {hero.ctaPrimary.label}
              </Link>
              <Link
                href={hero.ctaSecondary.href}
                className="inline-flex items-center justify-center rounded-full border border-white/25 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-slate-100 no-underline transition hover:no-underline hover:bg-white/[0.12]"
              >
                {hero.ctaSecondary.label}
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {hero.proofCards.map((card) => (
                <article key={card.title} className="rounded-xl border border-white/16 bg-black/30 px-4 py-3">
                  <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-amber-100">
                    {card.title}
                  </p>
                  <p className="mt-1.5 text-[14px] leading-6 text-slate-200">{card.detail}</p>
                </article>
              ))}
            </div>

            <Link
              href={hero.featured.href}
              className="group block rounded-2xl border border-amber-200/30 bg-amber-300/10 px-4 py-3.5 transition hover:border-amber-200/50 hover:bg-amber-300/16"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-amber-100">
                  Featured War Room
                </p>
                <span className="rounded-full border border-amber-200/35 bg-black/20 px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.12em] text-amber-100">
                  {hero.featured.evidenceLabel}
                </span>
              </div>
              <p className="mt-2 text-[16px] font-semibold leading-6 text-slate-100">
                {hero.featured.title}
              </p>
              <p className="mt-1 text-[14px] leading-6 text-slate-200">{hero.featured.decision}</p>
              <p className="mt-2 font-mono text-[12px] text-amber-100">
                {hero.featured.outputLabel}: {hero.featured.outputValue}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-300">
                Source: {hero.featured.source} · As of {hero.featured.asOf}
              </p>
            </Link>
          </div>

          <aside className="surface-data space-y-3.5 p-4 sm:p-5" data-signal-board>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-300">
                Live Signal Example
              </p>
              <span className="rounded-full border border-white/20 bg-white/[0.06] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-200">
                Scenario
              </span>
            </div>
            <p className="text-sm text-slate-200">{payload.scenario}</p>
            <p className="text-sm text-slate-300">{payload.description}</p>
            <p className="rounded-lg border border-white/14 bg-black/22 px-3 py-2 text-[14px] leading-6 text-slate-100">
              {hero.proofLine}
            </p>

            <div className="flex flex-wrap gap-2">
              {hero.modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={
                    item.id === mode
                      ? "rounded-full border border-amber-300/45 bg-amber-300/20 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-amber-100"
                      : "rounded-full border border-white/20 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-200 hover:bg-white/[0.1]"
                  }
                  aria-pressed={item.id === mode}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-white/15 bg-black/24 p-3">
              <svg
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                className="h-auto w-full"
                role="img"
                aria-label={`${payload.label} chart`}
              >
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                  <line
                    key={`h-${tick}`}
                    x1={0}
                    x2={chart.width}
                    y1={tick * chart.height}
                    y2={tick * chart.height}
                    stroke="rgba(182,169,151,0.18)"
                    strokeDasharray="4 8"
                  />
                ))}
                {chart.tickIndexes.map((idx) => (
                  <line
                    key={`v-${idx}`}
                    x1={chart.x(idx)}
                    x2={chart.x(idx)}
                    y1={0}
                    y2={chart.height}
                    stroke="rgba(182,169,151,0.13)"
                    strokeDasharray="3 9"
                  />
                ))}

                <line
                  x1={annotationX}
                  x2={annotationX}
                  y1={0}
                  y2={chart.height}
                  stroke="rgba(244,238,228,0.42)"
                  strokeDasharray="6 8"
                />
                <circle cx={annotationX} cy={annotationY} r={5.2} fill="rgba(244,238,228,0.95)" />

                <path d={chart.stressPath} fill="none" stroke="rgba(157,49,49,0.9)" strokeWidth={2.8} />
                <path d={chart.baselinePath} fill="none" stroke="rgba(73,95,69,0.92)" strokeWidth={2.8} />
                <path d={chart.primaryPath} fill="none" stroke="rgba(198,153,98,0.98)" strokeWidth={3.4} />

                <text
                  x={chart.width - 8}
                  y={chart.y(payload.primarySeries[payload.primarySeries.length - 1] ?? 0) - 7}
                  textAnchor="end"
                  fill="rgba(198,153,98,0.98)"
                  fontSize="13"
                  data-chart-legend
                >
                  Policy
                </text>
                <text
                  x={chart.width - 8}
                  y={chart.y(payload.secondarySeries[payload.secondarySeries.length - 1] ?? 0) - 7}
                  textAnchor="end"
                  fill="rgba(126,170,120,0.95)"
                  fontSize="13"
                  data-chart-legend
                >
                  Baseline
                </text>
                <text
                  x={chart.width - 8}
                  y={chart.y(payload.tertiarySeries[payload.tertiarySeries.length - 1] ?? 0) + 13}
                  textAnchor="end"
                  fill="rgba(218,123,123,0.96)"
                  fontSize="13"
                  data-chart-legend
                >
                  Stress
                </text>
              </svg>

              <div className="mt-2.5 space-y-1.5">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300" data-chart-axis>
                  X: {payload.xAxisLabel}
                </p>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300" data-chart-axis>
                  Y: {payload.axisLabel} · {payload.unit}
                </p>
                <p className="text-[13px] leading-6 text-amber-100">
                  {payload.annotationTitle} at step {payload.annotationIndex + 1}: {payload.annotationDetail}
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
