"use client";

import Link from "next/link";
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

export function HomeProjectGrid({ cards }: HomeProjectGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section id="projects" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-300">
            Project Index
          </p>
          <h2 className="mt-2 max-w-4xl font-display text-[34px] leading-tight text-slate-50 sm:text-[44px]">
            Six thesis-grade decision simulations
          </h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-200 sm:text-[17px]">
            Each card exposes the business question, method, quantified output, and evidence status
            before you open the full simulator.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card, idx) => {
          const featured = idx === 0;
          return (
            <motion.div
              key={card.slug}
              className={featured ? "md:col-span-2" : undefined}
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Link
                href={card.href}
                className="group block rounded-3xl border border-white/25 bg-[rgba(22,19,16,0.88)] p-5 no-underline transition hover:-translate-y-0.5 hover:border-amber-200/45 hover:bg-[rgba(31,27,23,0.94)] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/70 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {featured ? (
                      <span className="rounded-full border border-amber-300/40 bg-amber-300/18 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] text-amber-100">
                        Featured
                      </span>
                    ) : null}
                    <span
                      className={evidenceClass(card.evidenceLevel)}
                      data-evidence-badge
                      title={card.provenanceLong}
                    >
                      <span aria-hidden="true">{card.evidenceBadge.icon}</span>
                      <span>{card.evidenceBadge.label}</span>
                    </span>
                  </div>
                  <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-slate-300">
                    {card.methodPlain}
                  </p>
                </div>

                <h3 className={`mt-4 font-semibold leading-[1.13] text-slate-50 ${featured ? "text-[29px]" : "text-[24px]"}`}>
                  {card.title}
                </h3>
                <p className="mt-1.5 text-[15px] text-slate-200">{card.subtitle}</p>
                <p className="mt-3 text-[15px] leading-7 text-slate-200 sm:text-base">{card.problem}</p>

                <div className={`mt-5 grid gap-4 ${featured ? "lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"}`}>
                  <div className="space-y-4">
                    <div className="rounded-xl border border-white/20 bg-black/28 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-mono text-[13px] uppercase tracking-[0.12em] text-slate-300">
                          {card.resultLabel}
                        </p>
                        <span className={evidenceClass(card.evidenceLevel)} data-evidence-badge>
                          <span aria-hidden="true">{card.evidenceBadge.icon}</span>
                          <span>{card.evidenceBadge.label}</span>
                        </span>
                      </div>
                      <p className="mt-2 text-[26px] font-bold leading-tight text-amber-100">{card.resultValue}</p>
                      <p className="mt-2 text-[14px] font-semibold text-amber-50">{card.claimFraming}</p>
                      <p className="mt-2 text-[15px] leading-7 text-slate-200">{card.claim}</p>
                    </div>

                    <div
                      className="rounded-xl border border-white/20 bg-black/30 px-4 py-3.5"
                      data-provenance-row
                      title={card.provenanceLong}
                    >
                      <p className="font-mono text-[13px] text-slate-200">Source: {card.source}</p>
                      <p className="mt-1 font-mono text-[13px] text-slate-300">As of {card.asOf}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <HomeProjectGlyph
                      vizType={card.vizType}
                      series={card.spark}
                      markerLabel={card.markerLabel}
                      annotation={card.annotation}
                    />
                    <div
                      className="flex items-center justify-between rounded-xl border border-amber-200/28 bg-amber-300/12 px-4 py-3.5 transition group-hover:border-amber-200/55 group-hover:bg-amber-300/20"
                      data-card-cta
                    >
                      <span className="font-mono text-[13px] uppercase tracking-[0.12em] text-slate-100">
                        Open simulator
                      </span>
                      <span className="text-[20px] text-amber-100 transition group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
