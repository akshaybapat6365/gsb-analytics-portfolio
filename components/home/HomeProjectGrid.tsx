"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HomeProjectCardVM } from "@/lib/viewmodels/home";
import { ACCENT_BY_SLUG, DOMAIN_BY_SLUG } from "@/lib/chartTheme";
import { CardMiniViz } from "./CardMiniViz";

type Props = { cards: HomeProjectCardVM[] };

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
          const accent = ACCENT_BY_SLUG[card.slug];
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
                {/* ── Thumbnail: D3 Mini-Visualization ── */}
                <div className="relative h-[220px] overflow-hidden border-b border-white/[0.03]">
                  {/* Accent glow */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.06]"
                    style={{
                      background: `radial-gradient(ellipse 60% 80% at 50% 90%, rgba(${accent}, 1) 0%, transparent 70%)`,
                    }}
                    aria-hidden="true"
                  />
                  {/* D3-rendered visualization */}
                  <div className="absolute inset-x-3 inset-y-2">
                    <CardMiniViz
                      vizType={card.vizType}
                      data={card.spark}
                      accent={accent}
                    />
                  </div>
                  {/* Domain tag */}
                  <p className="absolute left-4 top-3 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {DOMAIN_BY_SLUG[card.slug]}
                  </p>
                </div>

                {/* ── Card Body ──────────────────────── */}
                <div className="flex flex-1 flex-col px-6 py-5">
                  {/* Title */}
                  <h3 className="text-[18px] font-semibold leading-snug tracking-tight text-white">
                    {card.title}
                  </h3>

                  {/* One-line decision */}
                  <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-slate-400">
                    {card.claim}
                  </p>

                  {/* Metric + Evidence strip */}
                  <div className="mt-auto pt-5">
                    <p
                      className="text-[22px] font-bold leading-none tracking-tight"
                      style={{ color: `rgba(${accent}, 0.92)` }}
                    >
                      {card.resultValue}
                    </p>

                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-slate-500">
                      {card.evidenceBadge.icon}{" "}
                      {card.evidenceLevel.toUpperCase()} · {card.evidenceMeta.split("·").slice(1).join("·").trim()}
                    </p>
                  </div>

                  {/* CTA */}
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
