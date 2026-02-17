"use client";

import { RouteError } from "@/components/ui/RouteError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      title="ORD–LGA Price War Simulator"
      hint="If this happened after navigation, it’s usually a payload parse issue or a client-side visualization crash."
      error={error}
      reset={reset}
    />
  );
}

