"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { FareDistByDow } from "./transforms";

// Steps 36–41: Joy-plot / Ridge line chart of fare distribution by DOW
export default function FareDistributionRidge({ data }: { data: FareDistByDow[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredDow, setHoveredDow] = useState<string | null>(null);

    const dims = useMemo(() => ({
        width: 720,
        height: 420,
        margin: { top: 40, right: 24, bottom: 40, left: 60 },
    }), []);

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        const { width, height, margin } = dims;
        const inner = { w: width - margin.left - margin.right, h: height - margin.top - margin.bottom };

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const g = svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Price (x) scale
        const allPrices = data.flatMap(d => d.actual.map(p => p.price));
        const x = d3.scaleLinear()
            .domain([d3.min(allPrices) ?? 180, d3.max(allPrices) ?? 360])
            .range([0, inner.w]);

        // DOW (y) scale — band scale for row positioning
        const rowHeight = inner.h / data.length;
        const overlap = 0.25; // 25% overlap

        // Max density for normalization
        const maxDensity = d3.max(data.flatMap(d => [...d.actual.map(p => p.density), ...d.policy.map(p => p.density)])) ?? 0.01;
        const densityScale = rowHeight * (1 + overlap) / maxDensity;

        // X axis
        g.append("g")
            .attr("transform", `translate(0,${inner.h})`)
            .call(d3.axisBottom(x).ticks(6).tickFormat(d => `$${d}`))
            .call(g => g.select(".domain").attr("stroke", "rgba(148,163,184,0.1)"))
            .call(g => g.selectAll(".tick line").attr("stroke", "rgba(148,163,184,0.06)"))
            .call(g => g.selectAll(".tick text")
                .attr("fill", "var(--radar-text-2, #94a3b8)")
                .style("font-family", "var(--font-mono, 'JetBrains Mono', monospace)")
                .style("font-size", "9px"));

        // Draw each DOW row
        data.forEach((dow, i) => {
            const baseY = (i + 1) * rowHeight;
            const isHovered = hoveredDow === dow.dow;
            const opacity = hoveredDow === null ? 1 : isHovered ? 1 : 0.2;

            const rowG = g.append("g")
                .attr("transform", `translate(0, ${baseY})`)
                .attr("opacity", opacity)
                .style("transition", "opacity 0.3s ease")
                .on("mouseenter", () => setHoveredDow(dow.dow))
                .on("mouseleave", () => setHoveredDow(null))
                .style("cursor", "pointer");

            // Actual fare KDE area
            const actualArea = d3.area<{ price: number; density: number }>()
                .x(d => x(d.price))
                .y0(0)
                .y1(d => -d.density * densityScale)
                .curve(d3.curveNatural);

            rowG.append("path")
                .datum(dow.actual)
                .attr("d", actualArea)
                .attr("fill", "rgba(148,163,184,0.15)")
                .attr("stroke", "rgba(148,163,184,0.5)")
                .attr("stroke-width", 1.2);

            // Policy fare KDE area
            rowG.append("path")
                .datum(dow.policy)
                .attr("d", actualArea)
                .attr("fill", "rgba(201,150,43,0.12)")
                .attr("stroke", "var(--radar-amber, #c9962b)")
                .attr("stroke-width", 1.2)
                .attr("stroke-dasharray", "3,2");

            // Mean markers — actual
            rowG.append("line")
                .attr("x1", x(dow.actualMean)).attr("x2", x(dow.actualMean))
                .attr("y1", 0).attr("y2", -rowHeight * 0.4)
                .attr("stroke", "rgba(148,163,184,0.4)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "2,2");

            // Mean markers — policy
            rowG.append("line")
                .attr("x1", x(dow.policyMean)).attr("x2", x(dow.policyMean))
                .attr("y1", 0).attr("y2", -rowHeight * 0.4)
                .attr("stroke", "var(--radar-amber, #c9962b)")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "2,2");

            // DOW label
            rowG.append("text")
                .attr("x", -8)
                .attr("y", -2)
                .attr("text-anchor", "end")
                .attr("fill", isHovered ? "var(--radar-amber, #c9962b)" : "var(--radar-text-2, #94a3b8)")
                .attr("font-family", "var(--font-mono, 'JetBrains Mono', monospace)")
                .attr("font-size", "10px")
                .attr("font-weight", isHovered ? 600 : 400)
                .text(dow.dow);
        });

        // Hover summary card rendered in React below
    }, [data, dims, hoveredDow]);

    const hoveredData = useMemo(() => data.find(d => d.dow === hoveredDow), [data, hoveredDow]);

    return (
        <div className="radar-chart p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="radar-eyebrow">Fare Price Distributions</p>
                <div className="flex items-center gap-4 text-[10px] font-mono">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-0.5" style={{ background: "rgba(148,163,184,0.5)" }} />
                        <span className="text-slate-400">Actual</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block w-3 h-0.5" style={{ background: "var(--radar-amber)", borderBottom: "1px dashed" }} />
                        <span style={{ color: "var(--radar-amber)" }}>Policy</span>
                    </span>
                </div>
            </div>
            <svg ref={svgRef} className="w-full" style={{ maxHeight: 420 }} />
            {hoveredData && (
                <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/40 p-3 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">{hoveredData.dow}</span>
                    <span className="text-slate-300">Actual μ: ${Math.round(hoveredData.actualMean)}</span>
                    <span style={{ color: "var(--radar-amber)" }}>Policy μ: ${Math.round(hoveredData.policyMean)}</span>
                    <span style={{ color: hoveredData.policyMean < hoveredData.actualMean ? "var(--radar-green)" : "var(--radar-crimson)" }}>
                        Shift: {hoveredData.policyMean < hoveredData.actualMean ? "−" : "+"}${Math.abs(Math.round(hoveredData.policyMean - hoveredData.actualMean))}
                    </span>
                </div>
            )}
        </div>
    );
}
