import type { Metadata } from "next";
import { getProject } from "@/lib/projects/catalog";
import { loadFraudPayload } from "@/lib/server/payloads";
import { buildProjectMetadata, buildProjectSchema } from "@/lib/seo";

import { Hero } from "./Hero";
import { FraudShell } from "./FraudShell";
import { FraudInteractiveSection } from "./InteractiveSection";
import { RecoverabilityProbe } from "./RecoverabilityProbe";
import { resolveFraudRouteProbe } from "./recoverability";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { CaseStudyTrustStack } from "@/components/story/CaseStudyTrustStack";

const project = getProject("fraud-radar");
export const metadata: Metadata = buildProjectMetadata(project);

type FraudRadarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FraudRadarPage({ searchParams }: FraudRadarPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const probe = resolveFraudRouteProbe(resolvedSearchParams?.routeProbe);

  if (probe !== "none") {
    return <RecoverabilityProbe probe={probe} />;
  }

  const payload = await loadFraudPayload();
  const summary = project.homepage;

  return (
    <>
      <StructuredDataScript id="project-jsonld-fraud-radar" data={buildProjectSchema(project)} />
      <div className="space-y-9">
        <Hero payload={payload} />

        <CaseStudyTrustStack
          eyebrow="Forensic BLUF"
          question={project.businessQuestion}
          bluf={project.bluf}
          summary={summary}
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
          assumptions={[
            "Real filing/market feeds drive this module; when key sources are stale, readiness downgrades and recommendation confidence narrows.",
            "Adjusted risk blends accounting and language proxies; it is a triage score, not legal proof.",
            "Graph links represent pattern similarity and should be interpreted as investigative adjacency, not causality.",
            "Real-world swap path: EDGAR ingestion, transcript enrichment, calibrated labels, and out-of-time validation.",
          ]}
        />

        <FraudShell payload={payload} />

        <FraudInteractiveSection payload={payload} />
      </div>
    </>
  );
}
