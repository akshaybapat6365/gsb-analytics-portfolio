"use client";

import FraudClient from "./FraudClient";
import type { FraudPayload } from "@/lib/schemas/fraud";

export default function FraudInteractive({
  payload,
}: {
  payload: FraudPayload;
}) {
  return <FraudClient payload={payload} />;
}
