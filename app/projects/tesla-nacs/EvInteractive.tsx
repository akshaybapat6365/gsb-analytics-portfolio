"use client";

import EvClient from "./EvClient";
import type { EvPayload } from "@/lib/schemas/ev";

export default function EvInteractive({
  payload,
}: {
  payload: EvPayload;
}) {
  return <EvClient payload={payload} />;
}
