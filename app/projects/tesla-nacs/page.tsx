import type { Metadata } from "next";
import { getProject } from "@/lib/projects/catalog";
import { loadEvPayload } from "@/lib/server/payloads";
import { buildProjectMetadata, buildProjectSchema } from "@/lib/seo";

import { Hero } from "./Hero";
import { EvShell } from "./EvShell";
import { EvInteractiveSection } from "./InteractiveSection";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { CaseStudyTrustStack } from "@/components/story/CaseStudyTrustStack";

const project = getProject("tesla-nacs");
export const metadata: Metadata = buildProjectMetadata(project);

export default async function TeslaNacsPage() {
  const payload = await loadEvPayload();
  const summary = project.homepage;

  return (
    <>
      <StructuredDataScript id="project-jsonld-tesla-nacs" data={buildProjectSchema(project)} />
      <div className="space-y-9">
        <Hero payload={payload} />

        <CaseStudyTrustStack
          eyebrow="War-Game BLUF"
          question={project.businessQuestion}
          bluf={project.bluf}
          summary={summary}
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
          assumptions={[
            "Real traffic/station feeds determine module readiness and decision confidence bounds.",
            "Range anxiety index and competitor pressure are strategic stress multipliers, not measured real-time values.",
            "Priority queue should be interpreted as scenario-specific and re-optimized under updated demand feeds.",
            "Real-world swap path: DOE station inventory + EVI-Pro demand + dynamic pricing and corridor traffic ingestion.",
          ]}
        />

        <EvShell payload={payload} />

        <EvInteractiveSection payload={payload} />
      </div>
    </>
  );
}
