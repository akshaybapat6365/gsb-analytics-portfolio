import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { HomeCredibilityStrip } from "@/components/home/HomeCredibilityStrip";
import { HomeHeroSignalWall } from "@/components/home/HomeHeroSignalWall";
import { HomeProjectGrid } from "@/components/home/HomeProjectGrid";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { KpiCard } from "@/components/ui/KpiCard";
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
      <div className="space-y-10 pb-8 sm:space-y-12">
        <Reveal>
          <HomeHeroSignalWall hero={vm.hero} />
        </Reveal>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Portfolio KPI rail">
          <Reveal>
            <KpiCard
              label={vm.kpis[0].label}
              value={vm.kpis[0].value}
              hint={vm.kpis[0].hint}
              accent="amber"
              countValue={Number(vm.kpis[0].value)}
              countPad={2}
            />
          </Reveal>
          <Reveal delay={0.05}>
            <KpiCard
              label={vm.kpis[1].label}
              value={vm.kpis[1].value}
              hint={vm.kpis[1].hint}
              accent="crimson"
              countValue={Number(vm.kpis[1].value)}
              countPad={2}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <KpiCard
              label={vm.kpis[2].label}
              value={vm.kpis[2].value}
              hint={vm.kpis[2].hint}
              accent="emerald"
              countValue={Number(vm.kpis[2].value)}
              countPad={2}
            />
          </Reveal>
        </section>

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
