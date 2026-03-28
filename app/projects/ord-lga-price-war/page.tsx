import type { Metadata } from "next";
import { getProject } from "@/lib/projects/catalog";
import { loadAirlinePayload } from "@/lib/server/payloads";
import { buildProjectMetadata, buildProjectSchema } from "@/lib/seo";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";

import { Hero } from "./Hero";
import { OrdLgaInteractiveSection } from "./InteractiveSection";
import { OrdLgaShell } from "./OrdLgaShell";
import { RecoverabilityProbe } from "./RecoverabilityProbe";
import { resolveOrdLgaRouteProbe } from "./recoverability";
import { CaseStudyTrustStack } from "@/components/story/CaseStudyTrustStack";

const project = getProject("ord-lga-price-war");
export const metadata: Metadata = buildProjectMetadata(project);

type OrdLgaPriceWarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdLgaPriceWarPage({
  searchParams,
}: OrdLgaPriceWarPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const probe = resolveOrdLgaRouteProbe(resolvedSearchParams?.routeProbe);

  if (probe !== "none") {
    return <RecoverabilityProbe probe={probe} />;
  }

  const payload = await loadAirlinePayload();

  return (
    <>
      <StructuredDataScript
        id="project-jsonld-ord-lga-price-war"
        data={buildProjectSchema(project)}
      />
      <div className="space-y-9">
        <Hero payload={payload} />

        <CaseStudyTrustStack
          eyebrow="War-Room BLUF"
          question={project.businessQuestion}
          bluf={project.bluf}
          summary={project.homepage}
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
          assumptions={[
            "Observed airfare anchors are blended with inferred competitor behavior and modeled policy outputs; treat the recommendation as a decision aid, not direct historical truth.",
            "Revenue lift confidence bands reflect simulation uncertainty and should be read alongside competitor-response and elasticity sensitivity chapters.",
            "When upstream market references go stale or unavailable, current-run provenance and readiness state explain which route modules remain trustworthy.",
            "Real-world swap path: DOT DB1B or T-100 route demand, filed fare references, schedule disruption feeds, and internal booking telemetry for out-of-sample policy validation.",
          ]}
        />

        <OrdLgaShell payload={payload} />

        <OrdLgaInteractiveSection payload={payload} />
      </div>
    </>
  );
}
