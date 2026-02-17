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
      title="Tesla NACS War Game"
      hint="This route uses deck.gl. If the canvas fails to initialize, confirm your browser supports WebGL."
      error={error}
      reset={reset}
    />
  );
}

