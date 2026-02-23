"use client";

import dynamic from "next/dynamic";
import { LazyInteractiveGate } from "@/components/perf/LazyInteractiveGate";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

const ShrinkInteractive = dynamic(() => import("./ShrinkInteractive"), {
  ssr: false,
});

export function ShrinkInteractiveSection({ payload }: { payload: ShrinkPayload }) {
  return (
    <LazyInteractiveGate title="Interactive Chapter B · Store Operations Sandbox">
      <ShrinkInteractive payload={payload} />
    </LazyInteractiveGate>
  );
}
