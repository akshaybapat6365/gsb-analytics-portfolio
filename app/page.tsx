import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { HomeCredibilityStrip } from "@/components/home/HomeCredibilityStrip";
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
      <div className="space-y-20 sm:space-y-24">
        <HomeHeroSignalWall hero={vm.hero} kpis={vm.kpis} />

        <Reveal delay={0.06}>
          <section className="mx-auto max-w-5xl px-1">
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-sky-100/55 sm:text-[12px]">
              One evidence language across every project preview — trust level, source posture, and freshness stay visible without turning the homepage into a taxonomy lesson.
            </p>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <HomeProjectGrid cards={vm.cards} />
        </Reveal>

        <Reveal delay={0.1}>
          <HomeCredibilityStrip model={vm.credibility} />
        </Reveal>
      </div>
    </>
  );
}
