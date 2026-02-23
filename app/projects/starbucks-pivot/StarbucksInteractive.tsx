"use client";

import StarbucksClient from "./StarbucksClient";
import type { StarbucksPayload } from "@/lib/schemas/starbucks";

export default function StarbucksInteractive({
  payload,
}: {
  payload: StarbucksPayload;
}) {
  return <StarbucksClient payload={payload} />;
}
