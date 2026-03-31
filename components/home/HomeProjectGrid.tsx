"use client";

import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HomeProjectCardVM } from "@/lib/viewmodels/home";
import { ACCENT_BY_SLUG, DOMAIN_BY_SLUG } from "@/lib/chartTheme";
import { buildProjectTrustLabels } from "@/lib/projects/trust";
import { CardMiniViz } from "./CardMiniViz";

type Props = { cards: HomeProjectCardVM[] };

/* ── Component ───────────────────────────────────────── */

export function HomeProjectGrid({ cards }: Props) {
  const rm = useReducedMotion();

  return (
    <section id="projects" className="mx-auto max-w-[1180px]">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card, idx) => {
          const accent = ACCENT_BY_SLUG[card.slug];
          const style = { "--card-accent": accent } as CSSProperties;
          const trustLabels = buildProjectTrustLabels({
            homepageTitle: card.title,
            homepageSubtitle: card.subtitle,
            problem: "",
            methodPlain: card.methodPlain,
            resultLabel: card.resultLabel,
            resultValue: card.resultValue,
            claim: card.claim,
            claimFraming: card.claimFraming,
            claimType: "illustrative-simulation",
            timeframe: undefined,
            limitation: "",
            evidenceLevel: card.evidenceLevel,
            source: card.source,
            asOf: card.asOf,
            provenanceLong: card.provenanceLong,
            vizType: card.vizType,
            spark: card.spark,
            markerLabel: card.markerLabel,
            annotation: card.annotation,
          });

          return (
            <motion.article
              key={card.slug}
              initial={rm ? undefined : { opacity: 0, y: 24 }}
              whileInView={rm ? undefined : { opacity: 1, y: 0 }}
              whileHover={rm ? undefined : { y: -8 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={
                rm
                  ? { duration: 0 }
                  : { duration: 0.5, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Link
                href={card.href}
                style={style}
                className="group relative flex h-full flex-col overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,248,240,0.08),rgba(255,255,255,0.028))] no-underline shadow-[0_26px_90px_rgba(9,7,5,0.28)] backdrop-blur-xl transition-[transform,border-color,background-color,box-shadow] duration-300 hover:border-orange-200/24 hover:bg-[linear-gradient(180deg,rgba(255,248,240,0.11),rgba(255,255,255,0.04))] hover:shadow-[0_36px_120px_rgba(17,10,5,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/70"
              >
                <div className="relative h-[228px] overflow-hidden border-b border-white/8">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(${accent}, 0.2) 0%, rgba(31,21,15,0.12) 34%, rgba(10,10,16,0.74) 100%)`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,244,230,0.14),transparent_44%)]" aria-hidden="true" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),transparent_32%,rgba(255,255,255,0.04)_100%)]" aria-hidden="true" />
                  <div className="absolute right-4 top-4 z-20 rounded-full border border-white/16 bg-[rgba(20,13,10,0.48)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stone-100/84 backdrop-blur-md">
                    {DOMAIN_BY_SLUG[card.slug]}
                  </div>
                  <Image
                    src="/assets/generic/hero.svg"
                    alt=""
                    fill
                    priority={idx < 3}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover opacity-50 mix-blend-screen transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-4 bottom-4 h-[132px] rounded-[22px] border border-white/12 bg-[linear-gradient(180deg,rgba(31,20,14,0.24),rgba(11,11,18,0.42))] p-3 backdrop-blur-md">
                    <CardMiniViz vizType={card.vizType} data={card.spark} accent={accent} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 py-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-amber-100/14 bg-amber-100/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-50/92">
                      {card.evidenceBadge.icon} {trustLabels.evidenceBadgeLabel}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-stone-400">
                      {trustLabels.freshnessLabel}
                    </span>
                  </div>

                  <h3 className="mt-5 text-[22px] font-semibold leading-[1.1] tracking-[-0.03em] text-stone-50">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-[14px] leading-7 text-stone-200/76">
                    {card.claim}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                    <p className="min-w-0 text-[12px] leading-6 text-stone-300/54">
                      {card.methodPlain}
                    </p>
                    <span
                      className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-amber-100/82 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      Case study →
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
