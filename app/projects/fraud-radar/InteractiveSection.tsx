"use client";

import dynamic from "next/dynamic";
import { LazyInteractiveGate } from "@/components/perf/LazyInteractiveGate";
import type { FraudPayload } from "@/lib/schemas/fraud";

const FraudInteractive = dynamic(() => import("./FraudInteractive"), {
  ssr: false,
});

export function FraudInteractiveSection({ payload }: { payload: FraudPayload }) {
  return (
    <LazyInteractiveGate title="Interactive Chapter B · Forensic Workbench">
      <FraudInteractive payload={payload} />
    </LazyInteractiveGate>
  );
}
