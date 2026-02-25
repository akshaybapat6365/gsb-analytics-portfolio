"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { ValidationComparison } from "./transforms";

// Steps 53–55: Grouped horizontal bar chart for model validation metrics
export default function ValidationBenchmark({ data }: { data: ValidationComparison }) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const margin = { top: 48, right: 80, bottom: 30, left: 120 };
        const width = 720 - margin.left - margin.right;
        const height = 320 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const g = svg.attr("viewBox", "0 0 720 320").append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        // Train/Validation split timeline bar at top
        const splitG = svg.append("g").attr("transform", `translate(${margin.left}, 8)`);
        const totalDays = data.trainDays + data.valDays;
        const trainW = (data.trainDays / totalDays) * width;
        const valW = (data.valDays / totalDays) * width;

        splitG.append("rect").attr("x", 0).attr("y", 0).attr("width", trainW).attr("height", 14)
            .attr("rx", 3).attr("fill", "rgba(148,163,184,0.15)");
        splitG.append("rect").attr("x", trainW + 2).attr("y", 0).attr("width", valW).attr("height", 14)
            .attr("rx", 3).attr("fill", "rgba(201,150,43,0.2)");

        splitG.append("text").attr("x", trainW / 2).attr("y", 10).attr("text-anchor", "middle")
            .attr("fill", "var(--radar-text-2)").attr("font-family", "var(--font-mono)").attr("font-size", "8px")
            .text(`Train: ${data.trainDays}d`);
        splitG.append("text").attr("x", trainW + 2 + valW / 2).attr("y", 10).attr("text-anchor", "middle")
            .attr("fill", "var(--radar-amber)").attr("font-family", "var(--font-mono)").attr("font-size", "8px")
            .text(`Val: ${data.valDays}d`);

        // OOS lift annotations
        splitG.append("text").attr("x", width).attr("y", 28).attr("text-anchor", "end")
            .attr("fill", "var(--radar-green)").attr("font-family", "var(--font-mono)").attr("font-size", "9px")
            .text(`OOS lift: +$${Math.round(data.oosLiftStatic / 1000)}K vs static, +$${Math.round(data.oosLiftSticky / 1000)}K vs sticky`);

        // Group metrics
        const metrics = [...new Set(data.bars.map(b => b.metric))];
        const models = [...new Set(data.bars.map(b => b.model))];
        const barHeight = 14;
        const groupPadding = 20;
        const modelPadding = 4;

        const maxVal = d3.max(data.bars, b => Math.abs(b.value)) ?? 1;
        const xScale = d3.scaleLinear().domain([0, maxVal * 1.2]).range([0, width]);

        const modelColors: Record<string, string> = {
            "Static Baseline": "rgba(148,163,184,0.35)",
            "Sticky Baseline": "var(--radar-cyan, #22d3ee)",
            "Policy Model": "var(--radar-amber, #c9962b)",
        };

        metrics.forEach((metric, mi) => {
            const baseY = mi * (models.length * (barHeight + modelPadding) + groupPadding);

            // Metric label
            g.append("text").attr("x", -8).attr("y", baseY + barHeight)
                .attr("text-anchor", "end")
                .attr("fill", "var(--radar-text-2)").attr("font-family", "var(--font-mono)").attr("font-size", "10px")
                .text(metric);

            models.forEach((model, moi) => {
                const bar = data.bars.find(b => b.metric === metric && b.model === model);
                if (!bar) return;

                const by = baseY + moi * (barHeight + modelPadding);

                // Bar
                const rect = g.append("rect")
                    .attr("x", 0).attr("y", by)
                    .attr("width", 0).attr("height", barHeight)
                    .attr("rx", 3)
                    .attr("fill", modelColors[model] ?? "rgba(148,163,184,0.3)")
                    .attr("opacity", 0.8);

                // Animate
                rect.transition().duration(600).delay(mi * 120 + moi * 80)
                    .attr("width", xScale(Math.abs(bar.value)));

                // Best-in-class accent
                if (bar.isBest) {
                    g.append("rect")
                        .attr("x", 0).attr("y", by)
                        .attr("width", 3).attr("height", barHeight)
                        .attr("fill", "var(--radar-green, #3edd8f)")
                        .attr("rx", 1);
                }

                // Value label
                g.append("text")
                    .attr("x", xScale(Math.abs(bar.value)) + 6)
                    .attr("y", by + barHeight / 2 + 4)
                    .attr("fill", modelColors[model] ?? "var(--radar-text-2)")
                    .attr("font-family", "var(--font-mono)").attr("font-size", "9px")
                    .attr("opacity", 0)
                    .text(metric.includes("MAPE") ? `${(bar.value * 100).toFixed(1)}%` : `$${d3.format(",.0f")(Math.abs(bar.value))}`)
                    .transition().duration(400).delay(mi * 120 + moi * 80 + 300).attr("opacity", 1);
            });
        });

        // Legend
        const lg = g.append("g").attr("transform", `translate(${width - 240}, ${height - 20})`);
        models.forEach((model, i) => {
            lg.append("rect").attr("x", i * 88).attr("y", 0).attr("width", 10).attr("height", 10)
                .attr("rx", 2).attr("fill", modelColors[model] ?? "gray");
            lg.append("text").attr("x", i * 88 + 14).attr("y", 8)
                .attr("fill", "var(--radar-text-2)").attr("font-family", "var(--font-mono)").attr("font-size", "8px")
                .text(model.replace(" Baseline", ""));
        });
    }, [data]);

    return (
        <div className="radar-chart p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="radar-eyebrow">Model Validation Benchmark</p>
                <span className="font-mono text-[10px] text-slate-400">3 baselines × 3 metrics</span>
            </div>
            <svg ref={svgRef} className="w-full" style={{ maxHeight: 320 }} />
        </div>
    );
}
