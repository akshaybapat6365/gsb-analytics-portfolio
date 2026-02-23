"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HomeProjectCardVM } from "@/lib/viewmodels/home";

type Props = { cards: HomeProjectCardVM[] };

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

export function HomeProjectGrid({ cards }: Props) {
  const rm = useReducedMotion();

  return (
    <section id="projects">
      {/* ── Task 21: Section header ──────────────────── */}
      <div className="mb-8 flex items-end justify-between">
        <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.02em] text-white">
          The Work
        </h2>
        <span className="rounded-full border border-white/[0.08] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-500">
          {cards.length} projects
        </span>
      </div>

      {/* ── Task 20: 3-column grid, equal cards ──────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => {
          const accent = accentBySlug[card.slug];
          const style = { "--card-accent": accent } as CSSProperties;

          return (
            /* ── Task 22: Stagger animation ────────── */
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
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#111116] p-7 no-underline transition-all duration-200 hover:border-white/[0.18] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                {/* ── Task 25: Top accent line ───────── */}
                <div
                  className="absolute inset-x-0 top-0 h-[2px]"
                  style={{ background: `rgba(${accent}, 0.7)` }}
                  aria-hidden="true"
                />

                {/* ── Task 25: Subtle top glow ───────── */}
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-[0.04]"
                  style={{
                    background: `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(${accent}, 1) 0%, transparent 100%)`,
                  }}
                  aria-hidden="true"
                />

                {/* ── Task 26: Domain tag ─────────────── */}
                <p className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {domainBySlug[card.slug]}
                </p>

                {/* ── Task 27: Title ──────────────────── */}
                <h3 className="relative mt-3 text-[20px] font-semibold leading-tight tracking-tight text-white">
                  {card.title}
                </h3>

                {/* ── Task 27: Subtitle ───────────────── */}
                <p className="relative mt-2 line-clamp-2 text-[14px] leading-[1.6] text-slate-400">
                  {card.subtitle}
                </p>

                {/* ── Task 28: Result block ───────────── */}
                <div className="relative mt-auto pt-6">
                  <div className="border-y border-white/[0.04] bg-white/[0.02] px-4 py-3">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
                      {card.resultLabel}
                    </p>
                    <p
                      className="mt-1 text-[24px] font-bold leading-none tracking-tight"
                      style={{ color: `rgba(${accent}, 0.92)` }}
                    >
                      {card.resultValue}
                    </p>
                  </div>
                </div>

                {/* ── Task 29: Footer CTA row ─────────── */}
                <div className="relative mt-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-slate-300">
                    Explore →
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em]"
                    style={{ color: `rgba(${accent}, 0.6)` }}
                  >
                    {card.evidenceBadge.icon} {card.evidenceBadge.label}
                  </span>
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
