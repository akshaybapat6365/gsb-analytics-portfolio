"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { WeeklyBin } from "./transforms";

// Steps 60–62: Market share alluvial / stream chart
// Shows UAL vs Delta market share flowing across 13 weeks
export default function MarketShareAlluvial({ data }: { data: WeeklyBin[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverWeek, setHoverWeek] = useState<number | null>(null);

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        const margin = { top: 24, right: 24, bottom: 36, left: 24 };
        const width = 720 - margin.left - margin.right;
        const height = 260 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const g = svg.attr("viewBox", "0 0 720 260").append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
        const bandW = width / data.length;

        // UAL share area (top half) — proportional to share
        const uaArea = d3.area<WeeklyBin>()
            .x((_, i) => x(i))
            .y0(d => height / 2)
            .y1(d => height / 2 - d.avgUaShare * height * 0.8)
            .curve(d3.curveBasis);

        // DL share area (bottom half)
        const dlArea = d3.area<WeeklyBin>()
            .x((_, i) => x(i))
            .y0(d => height / 2)
            .y1(d => height / 2 + (1 - d.avgUaShare) * height * 0.8)
            .curve(d3.curveBasis);

        // Center line
        g.append("line").attr("x1", 0).attr("x2", width)
            .attr("y1", height / 2).attr("y2", height / 2)
            .attr("stroke", "rgba(148,163,184,0.08)").attr("stroke-dasharray", "3,3");

        // UAL area
        g.append("path").datum(data).attr("d", uaArea)
            .attr("fill", "rgba(201,150,43,0.18)")
            .attr("stroke", "var(--radar-amber, #c9962b)").attr("stroke-width", 1.5);

        // DL area
        g.append("path").datum(data).attr("d", dlArea)
            .attr("fill", "rgba(34,211,238,0.12)")
            .attr("stroke", "var(--radar-cyan, #22d3ee)").attr("stroke-width", 1.5);

        // Labels
        g.append("text").attr("x", 6).attr("y", height / 2 - 10)
            .attr("fill", "var(--radar-amber)").attr("font-family", "var(--font-mono)").attr("font-size", "9px")
            .text("UNITED");
        g.append("text").attr("x", 6).attr("y", height / 2 + 18)
            .attr("fill", "var(--radar-cyan)").attr("font-family", "var(--font-mono)").attr("font-size", "9px")
            .text("DELTA");

        // First and last share percentages
        const first = data[0]!;
        const last = data[data.length - 1]!;
        g.append("text").attr("x", x(0) - 2).attr("y", height / 2 - first.avgUaShare * height * 0.8 - 4).attr("text-anchor", "start")
            .attr("fill", "var(--radar-amber)").attr("font-family", "var(--font-mono)").attr("font-size", "10px").attr("font-weight", 600)
            .text(`${Math.round(first.avgUaShare * 100)}%`);
        g.append("text").attr("x", x(data.length - 1) + 2).attr("y", height / 2 - last.avgUaShare * height * 0.8 - 4).attr("text-anchor", "start")
            .attr("fill", "var(--radar-amber)").attr("font-family", "var(--font-mono)").attr("font-size", "10px").attr("font-weight", 600)
            .text(`${Math.round(last.avgUaShare * 100)}%`);

        // Shock week highlights
        data.forEach((week, i) => {
            if (week.shockCount > 0) {
                g.append("rect")
                    .attr("x", x(i) - bandW / 2).attr("y", 0)
                    .attr("width", bandW).attr("height", height)
                    .attr("fill", "rgba(224,69,58,0.04)")
                    .attr("stroke", "rgba(224,69,58,0.12)")
                    .attr("stroke-dasharray", "2,2")
                    .attr("rx", 3);
            }
        });

        // Week labels along bottom
        data.forEach((week, i) => {
            g.append("text")
                .attr("x", x(i)).attr("y", height + 16)
                .attr("text-anchor", "middle")
                .attr("fill", hoverWeek === i ? "var(--radar-amber)" : "var(--radar-text-2, #94a3b8)")
                .attr("font-family", "var(--font-mono)").attr("font-size", "8px")
                .text(`W${i + 1}`);
        });

        // Hover detection zones
        data.forEach((_, i) => {
            g.append("rect")
                .attr("x", x(i) - bandW / 2).attr("y", 0)
                .attr("width", bandW).attr("height", height)
                .attr("fill", "transparent").attr("cursor", "pointer")
                .on("mouseenter", () => setHoverWeek(i))
                .on("mouseleave", () => setHoverWeek(null));
        });

        // Hover highlight
        if (hoverWeek !== null && data[hoverWeek]) {
            g.append("line")
                .attr("x1", x(hoverWeek)).attr("x2", x(hoverWeek))
                .attr("y1", 0).attr("y2", height)
                .attr("stroke", "var(--radar-amber)").attr("stroke-width", 1).attr("opacity", 0.5);
        }
    }, [data, hoverWeek]);

    const hoverData = hoverWeek !== null ? data[hoverWeek] : null;

    return (
        <div className="radar-chart p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="radar-eyebrow">Market Share Flow</p>
                <span className="font-mono text-[10px] text-slate-400">{data.length} weeks · Q2 2023</span>
            </div>
            <svg ref={svgRef} className="w-full" style={{ maxHeight: 260 }} />
            {hoverData && (
                <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/40 p-3 grid grid-cols-4 gap-2 text-[10px] font-mono">
                    <div><span className="text-slate-500">Week</span><br /><span className="text-slate-300">W{(hoverWeek ?? 0) + 1}</span></div>
                    <div><span className="text-slate-500">UAL Share</span><br /><span style={{ color: "var(--radar-amber)" }}>{Math.round(hoverData.avgUaShare * 100)}%</span></div>
                    <div><span className="text-slate-500">Revenue</span><br /><span style={{ color: "var(--radar-green)" }}>${Math.round(hoverData.totalRevenue / 1000)}K</span></div>
                    <div><span className="text-slate-500">Shocks</span><br /><span style={{ color: hoverData.shockCount > 0 ? "var(--radar-crimson)" : "var(--radar-text-2)" }}>{hoverData.shockCount}</span></div>
                </div>
            )}
        </div>
    );
}
