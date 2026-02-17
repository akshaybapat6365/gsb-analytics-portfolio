import { getProject } from "@/lib/projects/catalog";
import { loadFraudPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import FraudClient from "./FraudClient";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { StoryVisual } from "@/components/projects/StoryVisual";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";

export const metadata = {
  title: "Fraud Radar",
};

export default async function FraudRadarPage() {
  const project = getProject("fraud-radar");
  const payload = await loadFraudPayload();

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Forensic BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
      />
      <RealSignalsPanel meta={payload.meta} signals={payload.realSignals} />

      <FraudClient payload={payload} />

      <section className="grid gap-4 lg:grid-cols-2">
        <StoryVisual
          slug="fraud-radar"
          asset="overlay"
          title="Forensic Overlay Map"
          caption="Replicate-generated forensic overlay used to frame risk-cluster interpretation."
        />
        <StoryVisual
          slug="fraud-radar"
          asset="diagram"
          title="Fraud Radar Diagram"
          caption="Signal fusion map: accounting anomalies, language mismatch, and similarity propagation."
        />
      </section>

      <AssumptionsDrawer
        items={[
          "Synthetic by default: filing-level fraud risk is generated from latent risk regimes plus explicit shock events.",
          "Adjusted risk blends accounting and language proxies; it is a triage score, not legal proof.",
          "Graph links represent pattern similarity and should be interpreted as investigative adjacency, not causality.",
          "Real-world swap path: EDGAR ingestion, transcript enrichment, calibrated labels, and out-of-time validation.",
        ]}
      />
    </div>
  );
}
