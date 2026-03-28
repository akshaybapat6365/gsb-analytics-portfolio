"use client";

import { ProjectFrame } from "@/components/layout/ProjectFrame";
import { AnnotatedVizFrame } from "@/components/viz/AnnotatedVizFrame";
import { ShrinkShellVisual } from "@/components/viz/shell/ShellPrimaryVisuals";
import type { ShrinkPayload } from "@/lib/schemas/shrink";
import { useTargetShrinkScenario } from "./TargetShrinkScenarioContext";

export function ShrinkShell({ payload }: { payload: ShrinkPayload }) {
  const { recommendationSurface: recommendation } = useTargetShrinkScenario();

  return (
    <ProjectFrame
      chapter="Interactive Chapter A"
      variant="operations"
      title="Threshold Frontier and Zone Pressure"
      subtitle="Tune policy threshold versus false-positive drag and inspect store-zone risk concentration before escalating interventions."
      value={recommendation.shellValue}
      valueLabel={`${recommendation.shellValueLabel} · ${recommendation.recommendationBadge}`}
    >
      <AnnotatedVizFrame
        title="Operations Evidence Rail"
        subtitle="Events and decision annotations map to zone pressure and policy outcomes."
        annotations={payload.annotations}
      >
        <ShrinkShellVisual payload={payload} />
      </AnnotatedVizFrame>
    </ProjectFrame>
  );
}
