import type { Metadata } from "next";
import { getProject } from "@/lib/projects/catalog";
import { loadAirlinePayload } from "@/lib/server/payloads";
import { buildProjectMetadata, buildProjectSchema } from "@/lib/seo";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";

import { Hero } from "./Hero";
import { OrdLgaInteractiveSection } from "./InteractiveSection";

const project = getProject("ord-lga-price-war");
export const metadata: Metadata = buildProjectMetadata(project);

export default async function OrdLgaPriceWarPage() {
  const payload = await loadAirlinePayload();

  return (
    <>
      <StructuredDataScript
        id="project-jsonld-ord-lga-price-war"
        data={buildProjectSchema(project)}
      />
      <div className="space-y-8">
        <Hero payload={payload} />

        {/* BLUF strip — integrated into radar theme */}
        <section className="radar-panel p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="radar-eyebrow">War-Room BLUF</p>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-slate-300/90">
                {project.businessQuestion}
              </p>
            </div>
          </div>
          <div className="radar-chapter-line mt-4" />
          <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_280px]">
            <p className="text-[14px] leading-7 text-slate-400">{project.bluf}</p>
            <div className="radar-kpi radar-glow-green">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--radar-green)" }}>
                {project.homepage.resultLabel}
              </p>
              <p className="mt-1 font-mono text-2xl" style={{ color: "var(--radar-green)" }}>
                {project.homepage.resultValue}
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
                {project.homepage.evidenceLevel.toUpperCase()} · {project.homepage.source} · as-of {project.homepage.asOf}
              </p>
            </div>
          </div>
        </section>

        {/* Full interactive experience */}
        <OrdLgaInteractiveSection payload={payload} />
      </div>
    </>
  );
}
