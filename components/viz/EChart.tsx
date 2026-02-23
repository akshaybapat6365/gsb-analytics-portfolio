"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/lib/cn";
import { VizErrorBoundary } from "@/components/viz/VizErrorBoundary";

type EChartProps = {
  option: EChartsOption;
  height?: number;
  mobileHeight?: number;
  minHeight?: number;
  className?: string;
  title?: string;
  dataTestId?: string;
};

export function EChart({
  option,
  height = 320,
  mobileHeight,
  minHeight,
  className,
  title,
  dataTestId = "primary-chart",
}: EChartProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(query.matches);
    sync();

    if (query.addEventListener) {
      query.addEventListener("change", sync);
      return () => query.removeEventListener("change", sync);
    }

    query.addListener(sync);
    return () => query.removeListener(sync);
  }, []);

  const baseHeight = isMobile ? (mobileHeight ?? Math.min(height, 360)) : height;
  const floor = minHeight ?? (isMobile ? 280 : 420);
  const resolvedHeight = Math.max(baseHeight, floor);

  return (
    <section className={cn("glass rounded-2xl p-3", className)} data-testid={dataTestId}>
      {title ? (
        <div className="px-2 pb-2 pt-1">
          <p className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300 sm:text-xs sm:tracking-[0.18em]">
            {title}
          </p>
        </div>
      ) : null}
      <VizErrorBoundary
        fallbackTitle={title ? `${title} unavailable` : "Visualization unavailable"}
        fallbackMessage="This chart failed to render in your browser. Core KPIs and narrative outputs remain available."
        height={resolvedHeight}
      >
        <ReactECharts
          option={option}
          style={{ height: resolvedHeight, width: "100%" }}
          opts={{ renderer: "canvas" }}
          notMerge
          lazyUpdate
        />
      </VizErrorBoundary>
    </section>
  );
}
