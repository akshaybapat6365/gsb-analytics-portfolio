import { getProject } from "@/lib/projects/catalog";
import { loadStarbucksPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import StarbucksClient from "./StarbucksClient";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { StoryVisual } from "@/components/projects/StoryVisual";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";

export const metadata = {
  title: "Starbucks Suburban Pivot",
};

export default async function StarbucksPivotPage() {
  const project = getProject("starbucks-pivot");
  const payload = await loadStarbucksPayload();

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Geo BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
      />
      <RealSignalsPanel meta={payload.meta} signals={payload.realSignals} />

      <StarbucksClient payload={payload} />

      <section className="grid gap-4 lg:grid-cols-2">
        <StoryVisual
          slug="starbucks-pivot"
          asset="overlay"
          title="Isochrone Overlay"
          caption="Replicate-generated geospatial overlay used for commute-collapse and suburban-shift storytelling."
        />
        <StoryVisual
          slug="starbucks-pivot"
          asset="diagram"
          title="Causal Surgery Diagram"
          caption="Difference-in-differences evidence translated into convert, lockers, and close actions."
        />
      </section>

      <AssumptionsDrawer
        items={[
          "Synthetic by default: WFH exposure and segment-level shock coefficients drive traffic/profit deltas.",
          "DiD headline is illustrative and should be interpreted as directional in this simulator payload.",
          "Recommendation confidence reflects model certainty under current scenario assumptions.",
          "Real-world swap path: SafeGraph + Placer + LODES with robust DiD diagnostics and unit-level financial mapping.",
        ]}
      />
    </div>
  );
}
