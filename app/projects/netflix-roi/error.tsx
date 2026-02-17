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
      title="Netflix Content ROI Autopsy"
      hint="If this fails, it’s typically a chart option or payload validation issue."
      error={error}
      reset={reset}
    />
  );
}

