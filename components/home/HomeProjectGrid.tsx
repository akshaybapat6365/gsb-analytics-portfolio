"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HomeProjectCardVM } from "@/lib/viewmodels/home";

type Props = { cards: HomeProjectCardVM[] };

/* ── Per-project accent RGB + viz type label ──────────── */

const accentBySlug: Record<HomeProjectCardVM["slug"], string> = {
  "ord-lga-price-war": "246,178,74",
  "fraud-radar": "220,60,180",
  "target-shrink": "245,200,75",
  "starbucks-pivot": "47,191,113",
  "tesla-nacs": "0,210,255",
  "netflix-roi": "229,50,50",
};

const domainBySlug: Record<HomeProjectCardVM["slug"], string> = {
  "ord-lga-price-war": "Pricing Strategy",
  "fraud-radar": "Forensic Risk",
  "target-shrink": "Retail Operations",
  "starbucks-pivot": "Geospatial Strategy",
  "tesla-nacs": "Infrastructure",
  "netflix-roi": "Capital Allocation",
};

/* ── Mini sparkline SVG ──────────────────────────────── */

function Sparkline({ data, accent }: { data: number[]; accent: string }) {
  const w = 300;
  const h = 80;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
      {/* Fill area under the line */}
      <polygon
        points={areaPoints}
        fill={`rgba(${accent}, 0.06)`}
      />
      {/* The line */}
      <polyline
        points={points}
        fill="none"
        stroke={`rgba(${accent}, 0.5)`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Endpoint dot */}
      <circle
        cx={w}
        cy={h - ((data[data.length - 1] - min) / range) * (h - 8) - 4}
        r="3"
        fill={`rgba(${accent}, 0.8)`}
      />
    </svg>
  );
}

/* ── Component ───────────────────────────────────────── */

export function HomeProjectGrid({ cards }: Props) {
  const rm = useReducedMotion();

  return (
    <section id="projects">
      {/* Section header */}
      <div className="mb-10 flex items-end justify-between">
        <h2 className="font-display text-[clamp(1.75rem,3.5vw,2.2rem)] leading-none tracking-[-0.02em] text-white">
          The Work
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-600">
          {cards.length} projects
        </span>
      </div>

      {/* 3-column grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => {
          const accent = accentBySlug[card.slug];
          const style = { "--card-accent": accent } as CSSProperties;

          return (
            <motion.article
              key={card.slug}
              initial={rm ? undefined : { opacity: 0, y: 20 }}
              whileInView={rm ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={
                rm
                  ? { duration: 0 }
                  : { duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Link
                href={card.href}
                style={style}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-[#111116] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#141419] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {/* ── Thumbnail Zone: Sparkline (top 35-40%) ── */}
                <div className="relative h-[120px] overflow-hidden border-b border-white/[0.04]">
                  {/* Subtle accent glow */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.08]"
                    style={{
                      background: `radial-gradient(ellipse 70% 80% at 50% 100%, rgba(${accent}, 1) 0%, transparent 70%)`,
                    }}
                    aria-hidden="true"
                  />
                  {/* Sparkline */}
                  <div className="absolute inset-x-4 bottom-0 top-4">
                    <Sparkline data={card.spark} accent={accent} />
                  </div>
                  {/* Domain tag over sparkline */}
                  <p className="absolute left-4 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {domainBySlug[card.slug]}
                  </p>
                  {/* Marker label */}
                  <span
                    className="absolute bottom-2 right-3 font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{ color: `rgba(${accent}, 0.6)` }}
                  >
                    {card.markerLabel}
                  </span>
                </div>

                {/* ── Card Body ─────────────────────────── */}
                <div className="flex flex-1 flex-col px-6 py-5">
                  {/* Title */}
                  <h3 className="text-[18px] font-semibold leading-snug tracking-tight text-white">
                    {card.title}
                  </h3>

                  {/* One-line decision */}
                  <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-slate-400">
                    {card.claim}
                  </p>

                  {/* Result metric + Evidence strip */}
                  <div className="mt-auto pt-5">
                    {/* Metric */}
                    <p
                      className="text-[22px] font-bold leading-none tracking-tight"
                      style={{ color: `rgba(${accent}, 0.92)` }}
                    >
                      {card.resultValue}
                    </p>

                    {/* Evidence strip — forced, adjacent to metric */}
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
                      {card.evidenceBadge.icon}{" "}
                      {card.evidenceLevel.toUpperCase()} · {card.evidenceMeta.split("·").slice(1).join("·").trim()}
                    </p>
                  </div>

                  {/* CTA row */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3">
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.12em] transition-all duration-200 group-hover:translate-x-0.5"
                      style={{ color: `rgba(${accent}, 0.7)` }}
                    >
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
