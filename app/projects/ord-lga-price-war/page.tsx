import { getProject } from "@/lib/projects/catalog";
import { loadAirlinePayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import { OrdLgaShell } from "./OrdLgaShell";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { OrdLgaInteractiveSection } from "./InteractiveSection";
import { DataIntegrityDrawer } from "@/components/story/DataIntegrityDrawer";

export const metadata = {
  title: "ORD–LGA Price War Simulator",
};

export default async function OrdLgaPriceWarPage() {
  const project = getProject("ord-lga-price-war");
  const payload = await loadAirlinePayload();
  const summary = project.homepage;

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="War-Room BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
        keyOutputLabel={summary.resultLabel}
        keyOutputValue={summary.resultValue}
        evidenceLine={`${summary.evidenceLevel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`}
        limitation={summary.limitation}
      />

      <OrdLgaShell payload={payload} />

      <OrdLgaInteractiveSection payload={payload} />

      <DataIntegrityDrawer>
        <RealSignalsPanel
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
        />
      </DataIntegrityDrawer>

      <AssumptionsDrawer
        items={[
          "Demand is modeled with isoelastic response plus stochastic shocks and a bounded fare surface to avoid unrealistic policy jumps.",
          "Competitor reaction is a constrained response function to emulate price desk latency and protect against unstable oscillations.",
          "All heavy model fitting runs offline; browser interactions recompute scenario outcomes instantly from validated payloads.",
          "Production calibration path: DOT DB1B + fare history ingestion + route-specific elasticity priors per booking cohort.",
        ]}
      />
    </div>
  );
}
