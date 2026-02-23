import { ProjectFrame } from "@/components/layout/ProjectFrame";
import { AnnotatedVizFrame } from "@/components/viz/AnnotatedVizFrame";
import { NetflixShellVisual } from "@/components/viz/shell/ShellPrimaryVisuals";
import { buildNetflixViewModel } from "@/lib/viewmodels/netflix";
import type { NetflixPayload } from "@/lib/schemas/netflix";

export function NetflixShell({ payload }: { payload: NetflixPayload }) {
  const vm = buildNetflixViewModel(payload);

  return (
    <ProjectFrame
      chapter="Interactive Chapter A"
      variant="cinematic"
      title="Acquisition vs. Retention Frontier"
      subtitle="Tune budget, buzz, acclaim, and retention weighting to optimize title-level allocation and greenlight confidence."
      value={vm.value}
      valueLabel={vm.valueLabel}
    >
      <AnnotatedVizFrame
        title="Committee Evidence Rail"
        subtitle="Annotation stream links allocation changes to source-backed performance inflections."
        annotations={payload.annotations}
      >
        <NetflixShellVisual payload={payload} />
      </AnnotatedVizFrame>
    </ProjectFrame>
  );
}
