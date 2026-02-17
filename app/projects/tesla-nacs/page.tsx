import { getProject } from "@/lib/projects/catalog";
import { loadEvPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import EvClient from "./EvClient";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { StoryVisual } from "@/components/projects/StoryVisual";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";

export const metadata = {
  title: "Tesla NACS War Game",
};

export default async function TeslaNacsPage() {
  const project = getProject("tesla-nacs");
  const payload = await loadEvPayload();

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="War-Game BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
      />
      <RealSignalsPanel meta={payload.meta} signals={payload.realSignals} />

      <EvClient payload={payload} />

      <section className="grid gap-4 lg:grid-cols-2">
        <StoryVisual
          slug="tesla-nacs"
          asset="overlay"
          title="Corridor Overlay"
          caption="Replicate-generated corridor overlay highlighting anxiety deserts and strategic bottleneck segments."
        />
        <StoryVisual
          slug="tesla-nacs"
          asset="diagram"
          title="Spatial Game Diagram"
          caption="Capture, cannibalization, and capex trade-offs on I-5 rollout sequencing."
        />
      </section>

      <AssumptionsDrawer
        items={[
          "Synthetic by default: adjusted NPV derives from capture lift, cannibalization drag, and capex inflation stress.",
          "Range anxiety index and competitor pressure are strategic stress multipliers, not measured real-time values.",
          "Priority queue should be interpreted as scenario-specific and re-optimized under updated demand feeds.",
          "Real-world swap path: DOE station inventory + EVI-Pro demand + dynamic pricing and corridor traffic ingestion.",
        ]}
      />
    </div>
  );
}
