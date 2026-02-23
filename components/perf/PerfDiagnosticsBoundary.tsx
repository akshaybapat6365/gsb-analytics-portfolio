"use client";

import dynamic from "next/dynamic";

const DevPerfDiagnostics = dynamic(
  () => import("@/components/perf/PerfDiagnostics").then((mod) => mod.PerfDiagnostics),
  { ssr: false },
);

export function PerfDiagnosticsBoundary() {
  const enabled = process.env.NEXT_PUBLIC_SHOW_PERF_DIAGNOSTICS === "1";

  if (process.env.NODE_ENV === "production" || !enabled) {
    return null;
  }

  return <DevPerfDiagnostics enabled={enabled} />;
}
