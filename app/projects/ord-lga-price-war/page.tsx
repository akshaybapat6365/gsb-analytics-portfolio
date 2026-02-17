import { getProject } from "@/lib/projects/catalog";
import { loadAirlinePayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import PriceWarClient from "./PriceWarClient";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { StoryVisual } from "@/components/projects/StoryVisual";

export const metadata = {
  title: "ORD–LGA Price War Simulator",
};

export default async function OrdLgaPriceWarPage() {
  const project = getProject("ord-lga-price-war");
  const payload = await loadAirlinePayload();

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="War-Room BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
      />

      <PriceWarClient payload={payload} />
      <RealSignalsPanel meta={payload.meta} signals={payload.realSignals} />

      <section className="grid gap-4 lg:grid-cols-2">
        <StoryVisual
          slug="ord-lga-price-war"
          asset="overlay"
          title="War-Room Overlay"
          caption="Replicate-generated decision overlay: shock vectors, booking-window pressure, and competitor response lattice."
        />
        <StoryVisual
          slug="ord-lga-price-war"
          asset="diagram"
          title="Counterfactual Policy Diagram"
          caption="Policy loop from market state to pricing action, regret tracking, and equilibrium response."
        />
      </section>

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
