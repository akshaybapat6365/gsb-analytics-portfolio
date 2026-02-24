"use client";

import { useState, useEffect } from "react";

/**
 * Dev-only banner. Renders ONLY on the client after mount to avoid
 * hydration mismatch (process.versions.node exists on the server
 * but is undefined in the browser).
 */
export function DevEnvBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Always return null until after mount — prevents SSR/client mismatch */
  if (!mounted || process.env.NODE_ENV === "production" || dismissed) {
    return null;
  }

  const nodeVersion =
    typeof process !== "undefined" && process.versions?.node
      ? process.versions.node
      : null;

  if (!nodeVersion) {
    return null;
  }

  const major = Number.parseInt(nodeVersion.split(".")[0] ?? "0", 10);
  if (major === 20) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] max-w-xs rounded-lg border border-white/[0.06] bg-[rgba(10,10,14,0.95)] px-3 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">
          Dev · Node {nodeVersion}
        </p>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-slate-600 transition-colors hover:text-white"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
