import { ProjectFrame } from "@/components/layout/ProjectFrame";
import { AnnotatedVizFrame } from "@/components/viz/AnnotatedVizFrame";
import { StarbucksShellVisual } from "@/components/viz/shell/ShellPrimaryVisuals";
import { buildStarbucksViewModel } from "@/lib/viewmodels/starbucks";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";

export function StarbucksShell({ payload }: { payload: StarbucksPayload }) {
  const vm = buildStarbucksViewModel(payload);

  return (
    <ProjectFrame
      chapter="Interactive Chapter A"
      variant="geo"
      title="WFH Portfolio Surgery"
      subtitle="Stress suburban and office exposure assumptions to recompute conversion, locker, and closure recommendations at location level."
      value={vm.value}
      valueLabel={vm.valueLabel}
    >
      <AnnotatedVizFrame
        title="Geo Evidence Rail"
        subtitle="Annotations tie recommendation inflections to segment-level deltas and DiD output."
        annotations={payload.annotations}
      >
        <StarbucksShellVisual payload={payload} />
      </AnnotatedVizFrame>
    </ProjectFrame>
  );
}
