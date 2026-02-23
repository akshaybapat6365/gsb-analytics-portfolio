import { getProject } from "@/lib/projects/catalog";
import { loadStarbucksPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import { StarbucksShell } from "./StarbucksShell";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { StarbucksInteractiveSection } from "./InteractiveSection";
import { DataIntegrityDrawer } from "@/components/story/DataIntegrityDrawer";

export const metadata = {
  title: "Starbucks Suburban Pivot",
};

export default async function StarbucksPivotPage() {
  const project = getProject("starbucks-pivot");
  const payload = await loadStarbucksPayload();
  const summary = project.homepage;

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Geo BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
        keyOutputLabel={summary.resultLabel}
        keyOutputValue={summary.resultValue}
        evidenceLine={`${summary.evidenceLevel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`}
        limitation={summary.limitation}
      />

      <StarbucksShell payload={payload} />

      <StarbucksInteractiveSection payload={payload} />

      <DataIntegrityDrawer>
        <RealSignalsPanel
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
        />
      </DataIntegrityDrawer>

      <AssumptionsDrawer
        items={[
          "Real mobility and market signals govern module readiness and confidence.",
          "DiD headline is illustrative and should be interpreted as directional in this simulator payload.",
          "Recommendation confidence reflects model certainty under current scenario assumptions.",
          "Real-world swap path: SafeGraph + Placer + LODES with robust DiD diagnostics and unit-level financial mapping.",
        ]}
      />
    </div>
  );
}
