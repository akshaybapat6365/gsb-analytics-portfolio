import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { HomeHeroSignalWall } from "@/components/home/HomeHeroSignalWall";
import { HomeProjectGrid } from "@/components/home/HomeProjectGrid";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { buildHomePageViewModel } from "@/lib/viewmodels/home";
import { projects } from "@/lib/projects/catalog";
import { buildPageMetadata, buildPersonSchema } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: { absolute: "Vaibhav Bapat | Decision Intelligence Portfolio" },
  description:
    "Interactive decision simulators for pricing, fraud, operations, geospatial strategy, infrastructure planning, and content portfolio allocation.",
  path: "/",
  theme: "ord-lga-price-war",
});

export default function HomePage() {
  const vm = buildHomePageViewModel(projects);

  return (
    <>
      <StructuredDataScript id="person-jsonld" data={buildPersonSchema()} />
      <div className="space-y-20 pb-4 sm:space-y-24">
        <HomeHeroSignalWall hero={vm.hero} kpis={vm.kpis} />

        <Reveal delay={0.06}>
          <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-1 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone-300/60 sm:text-[12px]">
                Case Studies
              </p>
              <h2 className="max-w-[14ch] text-balance font-display text-[clamp(2.6rem,5.6vw,4.8rem)] leading-[0.92] tracking-[-0.045em] text-stone-50">
                Warm, decision-first stories with the evidence kept in view.
              </h2>
              <p className="max-w-2xl text-[16px] leading-8 text-stone-200/72 sm:text-[17px]">
                A single rhythm leads the page: a clear introduction, a quick read on scope, and six glass-finished entry points into the full work.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-stone-300/62">
              <span className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 font-mono">
                {vm.cards.length} Case Studies
              </span>
              <span className="rounded-full border border-amber-200/14 bg-amber-200/[0.06] px-4 py-2 font-mono text-amber-100/80">
                Real + Modeled Evidence
              </span>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <HomeProjectGrid cards={vm.cards} />
        </Reveal>
      </div>
    </>
  );
}
