"use client";

import dynamic from "next/dynamic";
import { LazyInteractiveGate } from "@/components/perf/LazyInteractiveGate";
import type { AirlinePayload } from "@/lib/schemas/airline";

const OrdLgaInteractive = dynamic(() => import("./OrdLgaInteractive"), {
  ssr: false,
});

export function OrdLgaInteractiveSection({ payload }: { payload: AirlinePayload }) {
  return (
    <LazyInteractiveGate title="Interactive Chapter B · Counterfactual Command Sandbox">
      <OrdLgaInteractive payload={payload} />
    </LazyInteractiveGate>
  );
}
