import { getProject } from "@/lib/projects/catalog";
import { loadShrinkPayload } from "@/lib/server/payloads";

import { Hero } from "./Hero";
import { ShrinkShell } from "./ShrinkShell";
import { BlufPanel } from "@/components/story/BlufPanel";
import { AssumptionsDrawer } from "@/components/story/AssumptionsDrawer";
import { RealSignalsPanel } from "@/components/story/RealSignalsPanel";
import { ShrinkInteractiveSection } from "./InteractiveSection";
import { DataIntegrityDrawer } from "@/components/story/DataIntegrityDrawer";

export const metadata = {
  title: "Target Shrink Simulator",
};

export default async function TargetShrinkPage() {
  const project = getProject("target-shrink");
  const payload = await loadShrinkPayload();
  const summary = project.homepage;

  return (
    <div className="space-y-9">
      <Hero payload={payload} />

      <BlufPanel
        eyebrow="Ops BLUF"
        question={project.businessQuestion}
        bluf={project.bluf}
        keyOutputLabel={summary.resultLabel}
        keyOutputValue={summary.resultValue}
        evidenceLine={`${summary.evidenceLevel.toUpperCase()} · ${summary.source} · as-of ${summary.asOf}`}
        limitation={summary.limitation}
      />

      <ShrinkShell payload={payload} />

      <ShrinkInteractiveSection payload={payload} />

      <DataIntegrityDrawer>
        <RealSignalsPanel
          meta={payload.meta}
          signals={payload.realSignals}
          readiness={payload.dataReadiness}
        />
      </DataIntegrityDrawer>

      <AssumptionsDrawer
        items={[
          "Real event and market signals drive module readiness; missing feeds gate dependent decision outputs.",
          "Threshold policy is optimized for expected value, not pure classifier precision or recall.",
          "False-positive drag scales with customer LTV and event volume assumptions; tune via control rail.",
          "Real-world swap path: CV event streams + incident adjudication + store-level economics calibration.",
        ]}
      />
    </div>
  );
}
