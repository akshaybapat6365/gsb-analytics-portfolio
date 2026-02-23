"use client";

import NetflixClient from "./NetflixClient";
import type { NetflixPayload } from "@/lib/schemas/netflix";

export default function NetflixInteractive({
  payload,
}: {
  payload: NetflixPayload;
}) {
  return <NetflixClient payload={payload} />;
}
