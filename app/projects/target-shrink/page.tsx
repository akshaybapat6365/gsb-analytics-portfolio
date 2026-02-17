import { getProject } from "@/lib/projects/catalog";
import { loadShrinkPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import ShrinkClient from "./ShrinkClient";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { StoryVisual } from "@/components/projects/StoryVisual";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";

export const metadata = {
  title: "Target Shrink Simulator",
};

export default async function TargetShrinkPage() {
  const project = getProject("target-shrink");
  const payload = await loadShrinkPayload();

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Ops BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
      />
      <RealSignalsPanel meta={payload.meta} signals={payload.realSignals} />

      <ShrinkClient payload={payload} />

      <section className="grid gap-4 lg:grid-cols-2">
        <StoryVisual
          slug="target-shrink"
          asset="overlay"
          title="Store Pressure Overlay"
          caption="Replicate-generated overlay to contextualize zone pressure and intervention hotspots."
        />
        <StoryVisual
          slug="target-shrink"
          asset="diagram"
          title="Threshold Policy Diagram"
          caption="Bayesian stopping frontier balancing prevented theft against LTV-weighted false positives."
        />
      </section>

      <AssumptionsDrawer
        items={[
          "Synthetic by default: zone pressure drives event frequency and posterior theft probability trajectories.",
          "Threshold policy is optimized for expected value, not pure classifier precision or recall.",
          "False-positive drag scales with customer LTV and event volume assumptions; tune via control rail.",
          "Real-world swap path: CV event streams + incident adjudication + store-level economics calibration.",
        ]}
      />
    </div>
  );
}
