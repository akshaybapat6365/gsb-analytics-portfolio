"use client";

import dynamic from "next/dynamic";
import { LazyInteractiveGate } from "@/components/perf/LazyInteractiveGate";
import type { NetflixPayload } from "@/lib/schemas/netflix";

const NetflixInteractive = dynamic(() => import("./NetflixInteractive"), {
  ssr: false,
});

export function NetflixInteractiveSection({ payload }: { payload: NetflixPayload }) {
  return (
    <LazyInteractiveGate title="Interactive Chapter B · Allocation Committee">
      <NetflixInteractive payload={payload} />
    </LazyInteractiveGate>
  );
}
