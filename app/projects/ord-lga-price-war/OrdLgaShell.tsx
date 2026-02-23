import { ProjectFrame } from "@/components/layout/ProjectFrame";
import { AnnotatedVizFrame } from "@/components/viz/AnnotatedVizFrame";
import { OrdShellVisual } from "@/components/viz/shell/ShellPrimaryVisuals";
import { buildAirlineViewModel } from "@/lib/viewmodels/airline";
import type { AirlinePayload } from "@/lib/schemas/airline";

export function OrdLgaShell({ payload }: { payload: AirlinePayload }) {
  const vm = buildAirlineViewModel(payload);

  return (
    <ProjectFrame
      chapter="Interactive Chapter A"
      variant="warroom"
      title="Counterfactual Pricing Simulator"
      subtitle="Stress-test United pricing policy against competitor response and booking-window demand shocks."
      value={vm.value}
      valueLabel={vm.valueLabel}
    >
      <AnnotatedVizFrame
        title="Pricing Evidence Rail"
        subtitle={`Each callout ties to route-day outcomes and provenance. Validation MAPE: ${
          payload.validationSummary?.metrics.policyModel.mapeRevenue !== undefined
            ? `${(payload.validationSummary.metrics.policyModel.mapeRevenue * 100).toFixed(2)}%`
            : "n/a"
        }`}
        annotations={payload.annotations}
      >
        <OrdShellVisual payload={payload} />
      </AnnotatedVizFrame>
    </ProjectFrame>
  );
}
