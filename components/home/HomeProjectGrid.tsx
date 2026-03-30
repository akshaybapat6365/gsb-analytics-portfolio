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
      <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-sky-100/55">
            Selected case studies
          </p>
          <h2 className="max-w-[16ch] text-balance font-display text-[clamp(2.3rem,5vw,3.6rem)] leading-[0.95] tracking-[-0.04em] text-white">
            Six cleaner previews. One fast path to the full case study.
          </h2>
          <p className="max-w-2xl text-[15px] leading-7 text-slate-300 sm:text-[16px]">
            The homepage now stays focused: image-led cards, one-line summaries, visible evidence posture, and a direct jump into each decision packet.
          </p>
        </div>
        <span className="rounded-full border border-sky-300/12 bg-white/[0.03] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-sky-100/55">
          {cards.length} case studies
        </span>
      </div>

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
                className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-sky-300/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] no-underline shadow-[0_24px_70px_rgba(2,12,24,0.2)] transition-[transform,border-color,background-color,box-shadow] duration-300 hover:border-sky-300/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] hover:shadow-[0_34px_90px_rgba(2,12,24,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200/75"
              >
                <div className="relative h-[228px] overflow-hidden border-b border-white/6">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(${accent}, 0.14) 0%, rgba(7,12,22,0.08) 38%, rgba(7,12,22,0.68) 100%)`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_45%)]" aria-hidden="true" />
                  <div className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-slate-950/55 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-sky-50/85 backdrop-blur-sm">
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
                  <div className="absolute inset-x-4 bottom-4 h-[132px] rounded-[20px] border border-white/10 bg-slate-950/35 p-3 backdrop-blur-[2px]">
                    <CardMiniViz vizType={card.vizType} data={card.spark} accent={accent} />
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 py-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full border border-sky-200/15 bg-sky-300/[0.08] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-sky-50/90">
                      {card.evidenceBadge.icon} {trustLabels.evidenceBadgeLabel}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                      {trustLabels.freshnessLabel}
                    </span>
                  </div>

                  <h3 className="mt-5 text-[22px] font-semibold leading-[1.1] tracking-[-0.03em] text-white">
                    {card.title}
                  </h3>

                  <p className="mt-3 text-[14px] leading-7 text-slate-300">
                    {card.claim}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/8 pt-4">
                    <p className="min-w-0 text-[12px] leading-6 text-slate-400">
                      {card.methodPlain}
                    </p>
                    <span
                      className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] transition-transform duration-300 group-hover:translate-x-1"
                      style={{ color: `rgba(${accent}, 0.86)` }}
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
