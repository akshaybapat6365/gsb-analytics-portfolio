"use client";

import { useEffect, useMemo, useState } from "react";

type Snapshot = {
  htmlBytes: number;
  scriptBytes: number;
  interactiveReadyMs: number;
};

type PerfDiagnosticsProps = {
  enabled?: boolean;
};

export function PerfDiagnostics({ enabled = true }: PerfDiagnosticsProps) {
  const [mounted, setMounted] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const fmt = useMemo(() => new Intl.NumberFormat("en-US"), []);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV === "production") return;

    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      const resources = performance.getEntriesByType(
        "resource",
      ) as PerformanceResourceTiming[];

      const next: Snapshot = {
        htmlBytes: nav?.transferSize ?? 0,
        scriptBytes: resources
          .filter((entry) => entry.initiatorType === "script")
          .reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        interactiveReadyMs: Math.round(nav?.domContentLoadedEventEnd ?? 0),
      };

      setSnapshot(next);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !snapshot || process.env.NODE_ENV === "production") return;
    console.info("[perf] route diagnostics", {
      path: window.location.pathname,
      htmlBytes: snapshot.htmlBytes,
      scriptBytes: snapshot.scriptBytes,
      interactiveReadyMs: snapshot.interactiveReadyMs,
    });
  }, [enabled, snapshot]);

  if (!mounted || !enabled || process.env.NODE_ENV === "production" || !snapshot) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-[11px] text-slate-300 backdrop-blur">
      <p className="font-mono uppercase tracking-[0.14em] text-slate-400">Perf</p>
      <p className="mt-1 font-mono">HTML: {fmt.format(snapshot.htmlBytes)} B</p>
      <p className="font-mono">Scripts: {fmt.format(snapshot.scriptBytes)} B</p>
      <p className="font-mono">Ready: {snapshot.interactiveReadyMs} ms</p>
    </div>
  );
}
