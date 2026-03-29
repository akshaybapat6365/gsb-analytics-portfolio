"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

type DataIntegrityDrawerProps = {
  children: React.ReactNode;
  className?: string;
  defaultOpen?: boolean;
  title?: string;
  subtitle?: string;
};

export function DataIntegrityDrawer({
  children,
  className,
  defaultOpen = false,
  title = "Feed Coverage & Provenance",
  subtitle = "Feed status, source lineage, and readiness diagnostics.",
}: DataIntegrityDrawerProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <section className={cn("surface-secondary p-4 sm:p-5", className)}>
      <div className="group">
        <button
          type="button"
          aria-controls={panelId}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/10 px-3 py-3 text-left transition hover:border-white/16 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-slate-300">
              {title}
            </p>
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          </div>
          <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-amber-100 transition group-hover:border-amber-200/40">
            {isOpen ? "Hide trust details" : "Open trust details"}
          </span>
        </button>
        <div id={panelId} className={cn("mt-4", !isOpen && "hidden")}>
          {children}
        </div>
      </div>
    </section>
  );
}
