"use client";

import ShrinkClient from "./ShrinkClient";
import type { ShrinkPayload } from "@/lib/schemas/shrink";

export default function ShrinkInteractive({
  payload,
}: {
  payload: ShrinkPayload;
}) {
  return <ShrinkClient payload={payload} />;
}
