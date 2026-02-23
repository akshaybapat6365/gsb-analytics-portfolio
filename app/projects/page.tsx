import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectsIndexGrid } from "@/components/projects/ProjectsIndexGrid";
import { projects } from "@/lib/projects/catalog";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Interactive Decision Simulators",
  description:
    "Six interactive strategy war rooms spanning pricing, fraud risk, retail operations, geospatial pivots, infrastructure planning, and content ROI.",
  path: "/projects",
  theme: "ord-lga-price-war",
});

export default function ProjectsIndexPage() {
  return (
    <div className="space-y-8 pb-6">
      <Reveal>
        <section className="surface-primary overflow-hidden p-5 sm:p-7">
          <div className="relative z-10">
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-slate-300">
              Strategy Case Library
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-[38px] font-semibold tracking-tight text-slate-50 sm:text-[56px]">
              Interactive decision war rooms
            </h1>
            <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-200 sm:text-[17px]">
              Every project is designed as a playable strategy product with
              parameter controls, visual counterfactuals, and a direct financial
              recommendation.
            </p>
            <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.14em] text-slate-300">
              Evidence status, source lineage, and as-of timestamp visible on every card
            </p>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.05}>
        <ProjectsIndexGrid projects={projects} />
      </Reveal>
    </div>
  );
}
