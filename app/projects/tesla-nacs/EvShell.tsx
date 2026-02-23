import { ProjectFrame } from "@/components/layout/ProjectFrame";
import { AnnotatedVizFrame } from "@/components/viz/AnnotatedVizFrame";
import { EvShellVisual } from "@/components/viz/shell/ShellPrimaryVisuals";
import { buildEvViewModel } from "@/lib/viewmodels/ev";
import type { EvPayload } from "@/lib/schemas/ev";

export function EvShell({ payload }: { payload: EvPayload }) {
  const vm = buildEvViewModel(payload);

  return (
    <ProjectFrame
      chapter="Interactive Chapter A"
      variant="systems"
      title="Corridor Build vs. Cannibalization"
      subtitle="Prioritize I-5 station decisions by testing range anxiety, capex inflation, and competitor pressure assumptions in one tactical board."
      value={vm.value}
      valueLabel={vm.valueLabel}
    >
      <AnnotatedVizFrame
        title="Corridor Evidence Rail"
        subtitle="Annotations flag capex/capture trade-offs and route bottleneck implications."
        annotations={payload.annotations}
      >
        <EvShellVisual payload={payload} />
      </AnnotatedVizFrame>
    </ProjectFrame>
  );
}
