"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HomeProjectCardVM } from "@/lib/viewmodels/home";

type HomeProjectGridProps = {
  cards: HomeProjectCardVM[];
};

function evidenceClass(level: HomeProjectCardVM["evidenceLevel"]) {
  if (level === "real") return "evidence-badge evidence-badge--real";
  if (level === "mixed") return "evidence-badge evidence-badge--mixed";
  return "evidence-badge evidence-badge--modeled";
}

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
  "starbucks-pivot": "Geo Portfolio",
  "tesla-nacs": "Infrastructure",
  "netflix-roi": "Capital Allocation",
};

export function HomeProjectGrid({ cards }: HomeProjectGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="projects" className="space-y-8 sm:space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Projects</p>
          <h2 className="mt-2 font-display text-[32px] leading-[1.02] text-white sm:text-[46px]">
            The Work
          </h2>
        </div>
        <span className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-400">
          {cards.length} projects
        </span>
      </div>

      <div className="grid gap-8 sm:gap-6 lg:grid-cols-3">
        {cards.map((card, idx) => {
          const cardStyle = {
            "--card-accent": accentBySlug[card.slug],
          } as CSSProperties;

          return (
            <motion.article
              key={card.slug}
              initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Link
                href={card.href}
                style={cardStyle}
                className="project-card group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-[rgba(12,12,20,0.6)] p-6 no-underline backdrop-blur-sm hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--card-accent),0.55)] sm:p-7"
              >
                <div className="project-card-glow" aria-hidden="true" />
                <div className="project-card-topline" aria-hidden="true" />

                <p className="relative z-[1] font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {domainBySlug[card.slug]}
                </p>

                <h3 className="relative z-[1] mt-4 text-[20px] font-semibold leading-[1.12] text-white sm:text-[22px]">
                  {card.title}
                </h3>
                <p className="relative z-[1] mt-3 line-clamp-2 text-[14px] leading-6 text-slate-400">
                  {card.subtitle}
                </p>

                <div className="relative z-[1] mt-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    {card.resultLabel}
                  </p>
                  <p className="mt-2 text-[36px] font-bold leading-[1.02] tracking-tight text-[rgba(var(--card-accent),0.98)]">
                    {card.resultValue}
                  </p>
                  <p className="sr-only">{card.claimFraming}</p>
                </div>

                <div className="relative z-[1] mt-8 flex items-center justify-between gap-3">
                  <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-200">
                    Explore →
                  </span>
                  <span
                    className={`${evidenceClass(card.evidenceLevel)} home-evidence-badge`}
                    data-evidence-badge
                    title={`${card.evidenceMeta}\n${card.provenanceLong}`}
                  >
                    <span aria-hidden="true">{card.evidenceBadge.icon}</span>
                    <span>{card.evidenceBadge.label}</span>
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
