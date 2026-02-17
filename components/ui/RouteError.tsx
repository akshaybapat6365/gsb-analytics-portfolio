"use client";

import { useEffect } from "react";

type RouteErrorProps = {
  title: string;
  error: Error & { digest?: string };
  reset: () => void;
  hint?: string;
};

export function RouteError({ title, error, reset, hint }: RouteErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-4">
      <div className="glass-strong rounded-3xl p-8">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          Route Error
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          {hint ??
            "This page failed to render. In dev, check the server logs for the underlying error."}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 font-sans text-sm font-semibold text-slate-950 hover:bg-cyan-200"
          >
            Retry render
          </button>
          <a
            href="/projects"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 font-sans text-sm font-semibold text-slate-100 no-underline hover:no-underline hover:bg-white/[0.07]"
          >
            Back to projects
          </a>
        </div>
      </div>

      <div className="terminal overflow-hidden">
        <div className="border-b border-white/10 bg-white/5 px-6 py-4">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            Diagnostics
          </p>
        </div>
        <div className="space-y-2 px-6 py-6 font-mono text-xs text-slate-300">
          <div>
            <span className="text-slate-400">message:</span> {error.message}
          </div>
          {error.digest ? (
            <div>
              <span className="text-slate-400">digest:</span> {error.digest}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
