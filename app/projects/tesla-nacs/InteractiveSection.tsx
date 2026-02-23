"use client";

import dynamic from "next/dynamic";
import { LazyInteractiveGate } from "@/components/perf/LazyInteractiveGate";
import type { EvPayload } from "@/lib/schemas/ev";

const EvInteractive = dynamic(() => import("./EvInteractive"), {
  ssr: false,
});

export function EvInteractiveSection({ payload }: { payload: EvPayload }) {
  return (
    <LazyInteractiveGate title="Interactive Chapter B · Corridor Strategy Sandbox">
      <EvInteractive payload={payload} />
    </LazyInteractiveGate>
  );
}
