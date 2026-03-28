import type { Metadata } from "next";
import { getProject } from "@/lib/projects/catalog";
import { loadShrinkPayload } from "@/lib/server/payloads";
import { buildProjectMetadata, buildProjectSchema } from "@/lib/seo";

import { Hero } from "./Hero";
import { ShrinkShell } from "./ShrinkShell";
import { ShrinkInteractiveSection } from "./InteractiveSection";
import { StructuredDataScript } from "@/components/seo/StructuredDataScript";
import { CaseStudyTrustStack } from "@/components/story/CaseStudyTrustStack";

const project = getProject("target-shrink");
export const metadata: Metadata = buildProjectMetadata(project);

export default async function TargetShrinkPage() {
  const payload = await loadShrinkPayload();
  const summary = project.homepage;

  return (
    <>
      <StructuredDataScript id="project-jsonld-target-shrink" data={buildProjectSchema(project)} />
      <div className="space-y-9">
        <Hero payload={payload} />

        <CaseStudyTrustStack
          eyebrow="Ops BLUF"
          question={project.businessQuestion}
          bluf={project.bluf}
          summary={summary}
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
          assumptions={[
            "Real event and market signals drive module readiness; missing feeds gate dependent decision outputs.",
            "Threshold policy is optimized for expected value, not pure classifier precision or recall.",
            "False-positive drag scales with customer LTV and event volume assumptions; tune via control rail.",
            "Real-world swap path: CV event streams + incident adjudication + store-level economics calibration.",
          ]}
        />

        <ShrinkShell payload={payload} />

        <ShrinkInteractiveSection payload={payload} />
      </div>
    </>
  );
}
