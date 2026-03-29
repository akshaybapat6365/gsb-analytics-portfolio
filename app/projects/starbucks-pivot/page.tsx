import type { Metadata } from "next";
import { getProject } from "@/lib/projects/catalog";
import { loadStarbucksPayload } from "@/lib/server/payloads";
import { buildProjectMetadata, buildProjectSchema } from "@/lib/seo";

import { Hero } from "./Hero";
import { StarbucksShell } from "./StarbucksShell";
import { StarbucksInteractiveSection } from "./InteractiveSection";
import { RecoverabilityProbe } from "./RecoverabilityProbe";
import { resolveStarbucksRouteProbe } from "./recoverability";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { CaseStudyTrustStack } from "@/components/story/CaseStudyTrustStack";

const project = getProject("starbucks-pivot");
export const metadata: Metadata = buildProjectMetadata(project);

type StarbucksPivotPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StarbucksPivotPage({ searchParams }: StarbucksPivotPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const probe = resolveStarbucksRouteProbe(resolvedSearchParams?.routeProbe);

  if (probe !== "none") {
    return <RecoverabilityProbe probe={probe} />;
  }

  const payload = await loadStarbucksPayload();
  const summary = project.homepage;

  return (
    <>
      <StructuredDataScript id="project-jsonld-starbucks-pivot" data={buildProjectSchema(project)} />
      <div className="space-y-9">
        <Hero payload={payload} />

        <CaseStudyTrustStack
          eyebrow="Geo BLUF"
          question={project.businessQuestion}
          bluf={project.bluf}
          summary={summary}
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
          assumptions={[
            "Real mobility and market signals govern module readiness and confidence.",
            "DiD headline is illustrative and should be interpreted as directional in this simulator payload.",
            "Recommendation confidence reflects model certainty under current scenario assumptions.",
            "Real-world swap path: SafeGraph + Placer + LODES with robust DiD diagnostics and unit-level financial mapping.",
          ]}
        />

        <StarbucksShell payload={payload} />

        <StarbucksInteractiveSection payload={payload} />
      </div>
    </>
  );
}
