"use client";

import dynamic from "next/dynamic";
import { LazyInteractiveGate } from "@/components/perf/LazyInteractiveGate";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";

const StarbucksInteractive = dynamic(() => import("./StarbucksInteractive"), {
  ssr: false,
});

export function StarbucksInteractiveSection({ payload }: { payload: StarbucksPayload }) {
  return (
    <LazyInteractiveGate title="Interactive Chapter B · Portfolio Surgeon">
      <StarbucksInteractive payload={payload} />
    </LazyInteractiveGate>
  );
}
