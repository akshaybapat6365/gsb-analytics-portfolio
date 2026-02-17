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
      title="Fraud Radar"
      hint="If this page fails, check the server logs for payload validation errors and the browser console for chart runtime errors."
      error={error}
      reset={reset}
    />
  );
}

