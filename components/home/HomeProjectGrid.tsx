"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HomeProjectCardVM } from "@/lib/viewmodels/home";
import { HomeProjectGlyph } from "@/components/viz/home/HomeProjectGlyph";

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
  "fraud-radar": "255,45,170",
  "target-shrink": "245,200,75",
  "starbucks-pivot": "47,191,113",
  "tesla-nacs": "0,229,255",
  "netflix-roi": "229,9,20",
};

export function HomeProjectGrid({ cards }: HomeProjectGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="projects" className="space-y-7 sm:space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300">Projects</p>
          <h2 className="mt-2 font-display text-[32px] leading-[1.03] text-slate-50 sm:text-[46px]">
            The Work
          </h2>
        </div>
        <span className="rounded-full border border-white/16 bg-white/[0.04] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-300">
          {cards.length} projects
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card, idx) => {
          const featured = idx === 0;
          const cardStyle = {
            "--card-accent": accentBySlug[card.slug],
          } as CSSProperties;

          return (
            <motion.div
              key={card.slug}
              className={featured ? "md:col-span-2" : undefined}
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Link
                href={card.href}
                style={cardStyle}
                className="project-card group block rounded-3xl border border-white/18 bg-[rgba(14,14,22,0.84)] p-5 no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(var(--card-accent),0.68)] sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <p className="rounded-full border border-white/16 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
                    {card.methodPlain}
                  </p>
                </div>

                <h3 className={`mt-4 leading-[1.1] text-slate-50 ${featured ? "text-[31px] font-semibold" : "text-[24px] font-semibold"}`}>
                  {card.title}
                </h3>
                <p className="mt-2 text-[15px] leading-7 text-slate-200">{card.subtitle}</p>

                <div className="mt-5 rounded-2xl border border-white/14 bg-black/34 px-4 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-300">
                      {card.resultLabel}
                    </p>
                    <span
                      className={evidenceClass(card.evidenceLevel)}
                      data-evidence-badge
                      title={`${card.evidenceMeta}\n${card.provenanceLong}`}
                    >
                      <span aria-hidden="true">{card.evidenceBadge.icon}</span>
                      <span>{card.evidenceBadge.label}</span>
                    </span>
                  </div>
                  <p className="mt-2 text-[28px] font-semibold leading-[1.02] text-[rgba(var(--card-accent),0.98)]">
                    {card.resultValue}
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-slate-200">{card.claimFraming}</p>
                </div>

                <div className="mt-4">
                  <HomeProjectGlyph
                    vizType={card.vizType}
                    series={card.spark}
                    markerLabel={card.markerLabel}
                    annotation={card.claim}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/14 bg-white/[0.03] px-4 py-3 transition-colors duration-300 group-hover:border-[rgba(var(--card-accent),0.4)] group-hover:bg-white/[0.06]">
                  <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-slate-100">
                    Open Simulator
                  </span>
                  <span className="text-[20px] text-[rgba(var(--card-accent),0.95)] transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
