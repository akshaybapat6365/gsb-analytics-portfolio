"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import { cn } from "@/lib/cn";
import { VizErrorBoundary } from "@/components/viz/VizErrorBoundary";

type EChartProps = {
  option: EChartsOption;
  height?: number;
  className?: string;
  title?: string;
};

export function EChart({ option, height = 320, className, title }: EChartProps) {
  return (
    <section className={cn("glass rounded-2xl p-3", className)}>
      {title ? (
        <div className="px-2 pb-2 pt-1">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {title}
          </p>
        </div>
      ) : null}
      <VizErrorBoundary
        fallbackTitle={title ? `${title} unavailable` : "Visualization unavailable"}
        fallbackMessage="This chart failed to render in your browser. Core KPIs and narrative outputs remain available."
        height={height}
      >
        <ReactECharts
          option={option}
          style={{ height, width: "100%" }}
          opts={{ renderer: "canvas" }}
          notMerge
          lazyUpdate
        />
      </VizErrorBoundary>
    </section>
  );
}
