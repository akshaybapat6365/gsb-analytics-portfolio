import { ProjectFrame } from "@/components/layout/ProjectFrame";
import { AnnotatedVizFrame } from "@/components/viz/AnnotatedVizFrame";
import { ShrinkShellVisual } from "@/components/viz/shell/ShellPrimaryVisuals";
import { buildShrinkViewModel } from "@/lib/viewmodels/shrink";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

export function ShrinkShell({ payload }: { payload: ShrinkPayload }) {
  const vm = buildShrinkViewModel(payload);

  return (
    <ProjectFrame
      chapter="Interactive Chapter A"
      variant="operations"
      title="Threshold Frontier and Zone Pressure"
      subtitle="Tune policy threshold versus false-positive drag and inspect store-zone risk concentration before escalating interventions."
      value={vm.value}
      valueLabel={vm.valueLabel}
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
