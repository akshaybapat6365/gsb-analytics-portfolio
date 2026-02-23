import { ProjectFrame } from "@/components/layout/ProjectFrame";
import { AnnotatedVizFrame } from "@/components/viz/AnnotatedVizFrame";
import { FraudShellVisual } from "@/components/viz/shell/ShellPrimaryVisuals";
import { buildFraudViewModel } from "@/lib/viewmodels/fraud";
import type { FraudPayload } from "@/lib/schemas/fraud";

export function FraudShell({ payload }: { payload: FraudPayload }) {
  const vm = buildFraudViewModel(payload);

  return (
    <ProjectFrame
      chapter="Interactive Chapter A"
      variant="forensic"
      title="Fraud Risk Timeline and Similarity Graph"
      subtitle="Shift risk weights and graph thresholds to identify early-warning deception regimes in filing language and accounting signals."
      value={vm.value}
      valueLabel={vm.valueLabel}
    >
      <AnnotatedVizFrame
        title="Forensic Evidence Rail"
        subtitle="Annotations track filing-level anomalies and links to supporting source series."
        annotations={payload.annotations}
      >
        <FraudShellVisual payload={payload} />
      </AnnotatedVizFrame>
    </ProjectFrame>
  );
}
