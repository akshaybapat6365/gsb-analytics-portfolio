import { getProject } from "@/lib/projects/catalog";
import { loadNetflixPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import { NetflixShell } from "./NetflixShell";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { NetflixInteractiveSection } from "./InteractiveSection";
import { DataIntegrityDrawer } from "@/components/story/DataIntegrityDrawer";

export const metadata = {
  title: "Netflix Content ROI Autopsy",
};

export default async function NetflixRoiPage() {
  const project = getProject("netflix-roi");
  const payload = await loadNetflixPayload();
  const summary = project.homepage;

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Studio BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
        keyOutputLabel={summary.resultLabel}
        keyOutputValue={summary.resultValue}
        evidenceLine={`${summary.evidenceLevel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`}
        limitation={summary.limitation}
      />

      <NetflixShell payload={payload} />

      <NetflixInteractiveSection payload={payload} />

      <DataIntegrityDrawer>
        <RealSignalsPanel
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
        />
      </DataIntegrityDrawer>

      <AssumptionsDrawer
        items={[
          "Real market and filing signals set readiness state; unavailable feeds lower recommendation confidence.",
          "Retention priority and buzz-decay sliders express portfolio preference, not observed causal certainty.",
          "Greenlight score is a decision aid blending acquisition and retention under current assumptions.",
          "Real-world swap path: Nielsen/JustWatch/Trends with synthetic-control/BSTS calibration and churn attribution.",
        ]}
      />
    </div>
  );
}
