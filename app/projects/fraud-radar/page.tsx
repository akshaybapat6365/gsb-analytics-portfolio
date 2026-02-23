import { getProject } from "@/lib/projects/catalog";
import { loadFraudPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import { FraudShell } from "./FraudShell";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { FraudInteractiveSection } from "./InteractiveSection";
import { DataIntegrityDrawer } from "@/components/story/DataIntegrityDrawer";

export const metadata = {
  title: "Fraud Radar",
};

export default async function FraudRadarPage() {
  const project = getProject("fraud-radar");
  const payload = await loadFraudPayload();
  const summary = project.homepage;

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Forensic BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
        keyOutputLabel={summary.resultLabel}
        keyOutputValue={summary.resultValue}
        evidenceLine={`${summary.evidenceLevel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`}
        limitation={summary.limitation}
      />

      <FraudShell payload={payload} />

      <FraudInteractiveSection payload={payload} />

      <DataIntegrityDrawer>
        <RealSignalsPanel
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
        />
      </DataIntegrityDrawer>

      <AssumptionsDrawer
        items={[
          "Real filing/market feeds drive this module; when key sources are stale, readiness downgrades and recommendation confidence narrows.",
          "Adjusted risk blends accounting and language proxies; it is a triage score, not legal proof.",
          "Graph links represent pattern similarity and should be interpreted as investigative adjacency, not causality.",
          "Real-world swap path: EDGAR ingestion, transcript enrichment, calibrated labels, and out-of-time validation.",
        ]}
      />
    </div>
  );
}
