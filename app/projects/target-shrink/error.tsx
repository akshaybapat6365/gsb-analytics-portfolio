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
      title="Target Shrink Simulator"
      hint="This route includes interactive SVG + charts. If WebGL isn’t supported, the page should still render; otherwise check the console."
      error={error}
      reset={reset}
    />
  );
}

