import { getProject } from "@/lib/projects/catalog";
import { loadNetflixPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import NetflixClient from "./NetflixClient";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { StoryVisual } from "@/components/projects/StoryVisual";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";

export const metadata = {
  title: "Netflix Content ROI Autopsy",
};

export default async function NetflixRoiPage() {
  const project = getProject("netflix-roi");
  const payload = await loadNetflixPayload();

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Studio BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
      />
      <RealSignalsPanel meta={payload.meta} signals={payload.realSignals} />

      <NetflixClient payload={payload} />

      <section className="grid gap-4 lg:grid-cols-2">
        <StoryVisual
          slug="netflix-roi"
          asset="overlay"
          title="Frontier Overlay"
          caption="Replicate-generated cinematic overlay for acquisition-retention frontier storytelling."
        />
        <StoryVisual
          slug="netflix-roi"
          asset="diagram"
          title="Portfolio Matrix Diagram"
          caption="Cost-to-LTV matrix and committee-style greenlight logic framing."
        />
      </section>

      <AssumptionsDrawer
        items={[
          "Synthetic by default: title-level LTV and model coefficients are illustrative offline exports.",
          "Retention priority and buzz-decay sliders express portfolio preference, not observed causal certainty.",
          "Greenlight score is a decision aid blending acquisition and retention under current assumptions.",
          "Real-world swap path: Nielsen/JustWatch/Trends with synthetic-control/BSTS calibration and churn attribution.",
        ]}
      />
    </div>
  );
}
