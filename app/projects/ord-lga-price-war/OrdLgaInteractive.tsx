"use client";

import PriceWarClient from "./PriceWarClient";
import type { AirlinePayload } from "@/lib/schemas/airline";

export default function OrdLgaInteractive({
  payload,
}: {
  payload: AirlinePayload;
}) {
  return <PriceWarClient payload={payload} />;
}
