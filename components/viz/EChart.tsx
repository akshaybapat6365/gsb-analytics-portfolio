"use client";

import React from "react";
import dynamic from "next/dynamic";
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
  summary?: string;
  dataTestId?: string;
};

const ReactECharts = dynamic(
  () => import("echarts-for-react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-xl border border-white/12 bg-white/[0.03]" />
    ),
  },
);

export function EChart({
  option,
  height = 320,
  mobileHeight,
  minHeight,
  className,
  title,
  summary,
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
  const chartLabel = title ? `${title} chart` : "Interactive chart";
  const summaryText =
    summary ??
    (title
      ? `${title}. Interactive chart with scenario-aware tooltips and keyboard-accessible controls.`
      : "Interactive chart with scenario-aware tooltips and keyboard-accessible controls.");
  const summaryId = `${dataTestId}-summary`;
  const titleId = title ? `${dataTestId}-title` : undefined;

  return (
    <figure className={cn("glass rounded-2xl p-3", className)} data-testid={dataTestId}>
      {title ? (
        <div className="px-2 pb-2 pt-1">
          <p
            id={titleId}
            className="font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-slate-300 sm:text-xs sm:tracking-[0.18em]"
          >
            {title}
          </p>
        </div>
      ) : null}
      <VizErrorBoundary
        fallbackTitle={title ? `${title} unavailable` : "Visualization unavailable"}
        fallbackMessage="This chart failed to render in your browser. Core KPIs and narrative outputs remain available."
        height={resolvedHeight}
      >
        <div role="img" aria-label={chartLabel} aria-labelledby={titleId} aria-describedby={summaryId}>
          <ReactECharts
            option={option}
            style={{ height: resolvedHeight, width: "100%" }}
            opts={{ renderer: "canvas" }}
            notMerge
            lazyUpdate
          />
        </div>
      </VizErrorBoundary>
      <figcaption id={summaryId} className="mt-2 px-2 text-[12px] leading-5 text-slate-300">
        {summaryText}
      </figcaption>
    </figure>
  );
}
