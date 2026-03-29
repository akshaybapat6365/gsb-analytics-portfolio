import type { Metadata } from "next";
import { getProject } from "@/lib/projects/catalog";
import { loadNetflixPayload } from "@/lib/server/payloads";
import { buildProjectMetadata, buildProjectSchema } from "@/lib/seo";

import { Hero } from "./Hero";
import { NetflixShell } from "./NetflixShell";
import { NetflixInteractiveSection } from "./InteractiveSection";
import { RecoverabilityProbe } from "./RecoverabilityProbe";
import { resolveNetflixRouteProbe } from "./recoverability";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { CaseStudyTrustStack } from "@/components/story/CaseStudyTrustStack";

const project = getProject("netflix-roi");
export const metadata: Metadata = buildProjectMetadata(project);

type NetflixRoiPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NetflixRoiPage({ searchParams }: NetflixRoiPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const probe = resolveNetflixRouteProbe(resolvedSearchParams?.routeProbe);

  if (probe !== "none") {
    return <RecoverabilityProbe probe={probe} />;
  }

  const payload = await loadNetflixPayload();
  const summary = project.homepage;

  return (
    <>
      <StructuredDataScript id="project-jsonld-netflix-roi" data={buildProjectSchema(project)} />
      <div className="space-y-9">
        <Hero payload={payload} />

        <CaseStudyTrustStack
          eyebrow="Studio BLUF"
          question={project.businessQuestion}
          bluf={project.bluf}
          summary={summary}
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
          assumptions={[
            "Real market and filing signals set readiness state; unavailable feeds lower recommendation confidence.",
            "Retention priority and buzz-decay sliders express portfolio preference, not observed causal certainty.",
            "Greenlight score is a decision aid blending acquisition and retention under current assumptions.",
            "Real-world swap path: Nielsen/JustWatch/Trends with synthetic-control/BSTS calibration and churn attribution.",
          ]}
        />

        <NetflixShell payload={payload} />

        <NetflixInteractiveSection payload={payload} />
      </div>
    </>
  );
}
