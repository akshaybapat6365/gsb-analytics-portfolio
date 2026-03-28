"use client";

import dynamic from "next/dynamic";
import { LazyInteractiveGate } from "@/components/perf/LazyInteractiveGate";

const ShrinkInteractive = dynamic(() => import("./ShrinkInteractive"), {
  ssr: false,
});

export function ShrinkInteractiveSection() {
  return (
    <LazyInteractiveGate title="Interactive Chapter B · Store Operations Sandbox">
      <ShrinkInteractive />
    </LazyInteractiveGate>
  );
}
