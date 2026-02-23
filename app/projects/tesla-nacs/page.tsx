import { getProject } from "@/lib/projects/catalog";
import { loadEvPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import { EvShell } from "./EvShell";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { EvInteractiveSection } from "./InteractiveSection";
import { DataIntegrityDrawer } from "@/components/story/DataIntegrityDrawer";

export const metadata = {
  title: "Tesla NACS War Game",
};

export default async function TeslaNacsPage() {
  const project = getProject("tesla-nacs");
  const payload = await loadEvPayload();
  const summary = project.homepage;

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="War-Game BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
        keyOutputLabel={summary.resultLabel}
        keyOutputValue={summary.resultValue}
        evidenceLine={`${summary.evidenceLevel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`}
        limitation={summary.limitation}
      />

      <EvShell payload={payload} />

      <EvInteractiveSection payload={payload} />

      <DataIntegrityDrawer>
        <RealSignalsPanel
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
        />
      </DataIntegrityDrawer>

      <AssumptionsDrawer
        items={[
          "Real traffic/station feeds determine module readiness and decision confidence bounds.",
          "Range anxiety index and competitor pressure are strategic stress multipliers, not measured real-time values.",
          "Priority queue should be interpreted as scenario-specific and re-optimized under updated demand feeds.",
          "Real-world swap path: DOE station inventory + EVI-Pro demand + dynamic pricing and corridor traffic ingestion.",
        ]}
      />
    </div>
  );
}
