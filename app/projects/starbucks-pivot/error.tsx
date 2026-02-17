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
      title="Starbucks Suburban Pivot"
      hint="This route includes deck.gl + MapLibre. If the map fails, the rest of the dashboard should still render."
      error={error}
      reset={reset}
    />
  );
}

