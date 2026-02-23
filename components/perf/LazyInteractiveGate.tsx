"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type LazyInteractiveGateProps = {
  children: React.ReactNode;
  title?: string;
  className?: string;
  rootMargin?: string;
  autoActivateOnMobile?: boolean;
};

export function LazyInteractiveGate({
  children,
  title = "Interactive Module",
  className,
  rootMargin = "240px",
  autoActivateOnMobile = true,
}: LazyInteractiveGateProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active || !autoActivateOnMobile || typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 768px)").matches) {
      const timer = window.setTimeout(() => setActive(true), 120);
      return () => window.clearTimeout(timer);
    }
  }, [active, autoActivateOnMobile]);

  useEffect(() => {
    if (!ref.current || active) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [active, rootMargin]);

  useEffect(() => {
    if (!active || process.env.NODE_ENV === "production") return;
    console.info("[perf] interactive-mounted", {
      title,
      atMs: Math.round(performance.now()),
      path: window.location.pathname,
    });
  }, [active, title]);

  return (
    <section
      ref={ref}
      data-testid="lazy-interactive-gate"
      data-state={active ? "active" : "idle"}
      className={cn("panel p-4 sm:p-5", className)}
    >
      {!active ? (
        <div className="space-y-3">
          <p className="font-mono text-[12px] uppercase tracking-[0.15em] text-slate-300">{title}</p>
          <p className="text-[14px] leading-6 text-slate-200">
            Interactive controls are loading. Scroll a bit further or wait one moment for the full simulator.
          </p>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
              Incoming modules
            </p>
            <p className="mt-1 text-[13px] leading-6 text-slate-300">
              Scenario sliders, stress charts, and recommendation console.
            </p>
          </div>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
