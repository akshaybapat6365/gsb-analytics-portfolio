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
  title: "Decision Intelligence Portfolio",
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
      <div className="space-y-20 pb-8 sm:space-y-24">
        <HomeHeroSignalWall hero={vm.hero} kpis={vm.kpis} />

        <Reveal delay={0.06}>
          <HomeProjectGrid cards={vm.cards} />
        </Reveal>

        <Reveal delay={0.08}>
          <HomeCredibilityStrip model={vm.credibility} />
        </Reveal>
      </div>
    </>
  );
}
