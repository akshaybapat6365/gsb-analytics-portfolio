"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import type { CompetitorLagPoint } from "./transforms";

// Steps 48–52: Dual-axis chart showing UAL price moves vs Delta response lag
export default function CompetitorResponseLag({ data }: { data: CompetitorLagPoint[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    const stats = useMemo(() => {
        if (!data.length) return { avgLag: 0, noResponse: 0 };
        const lags = data.map(d => d.dlResponseDays);
        return {
            avgLag: lags.reduce((a, b) => a + b, 0) / lags.length,
            noResponse: Math.round(data.filter(d => d.dlResponseDays >= 6).length / data.length * 100),
        };
    }, [data]);

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        const margin = { top: 24, right: 24, bottom: 40, left: 60 };
        const width = 720 - margin.left - margin.right;
        const halfHeight = 120;
        const gap = 16;
        const totalHeight = halfHeight * 2 + gap + margin.top + margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const g = svg.attr("viewBox", `0 0 720 ${totalHeight}`).append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand().domain(data.map((_, i) => String(i))).range([0, width]).padding(0.15);

        // Top panel: UAL price changes
        const maxChange = d3.max(data, d => Math.abs(d.uaPriceChange)) ?? 20;
        const yTop = d3.scaleLinear().domain([-maxChange, maxChange]).range([halfHeight, 0]).nice();

        // Label
        g.append("text").attr("x", 0).attr("y", -6)
            .attr("fill", "var(--radar-amber)").attr("font-family", "var(--font-mono)").attr("font-size", "9px").attr("letter-spacing", "0.12em")
            .text("UAL PRICE CHANGE ($)");

        // Zero line
        g.append("line").attr("x1", 0).attr("x2", width).attr("y1", yTop(0)).attr("y2", yTop(0))
            .attr("stroke", "rgba(148,163,184,0.12)").attr("stroke-dasharray", "2,2");

        // Top bars
        data.forEach((d, i) => {
            g.append("rect")
                .attr("x", x(String(i))!).attr("width", x.bandwidth())
                .attr("y", d.uaPriceChange >= 0 ? yTop(d.uaPriceChange) : yTop(0))
                .attr("height", Math.abs(yTop(d.uaPriceChange) - yTop(0)))
                .attr("rx", 2)
                .attr("fill", d.uaPriceChange >= 0 ? "var(--radar-amber, #c9962b)" : "var(--radar-cyan, #22d3ee)")
                .attr("opacity", hoverIdx === i ? 1 : 0.75)
                .attr("cursor", "pointer")
                .on("mouseenter", () => setHoverIdx(i))
                .on("mouseleave", () => setHoverIdx(null));
        });

        // Bottom panel: Delta response lag
        const topOfBottom = halfHeight + gap;
        const yBot = d3.scaleLinear().domain([0, 6]).range([topOfBottom, topOfBottom + halfHeight]);

        g.append("text").attr("x", 0).attr("y", topOfBottom - 6)
            .attr("fill", "var(--radar-cyan)").attr("font-family", "var(--font-mono)").attr("font-size", "9px").attr("letter-spacing", "0.12em")
            .text("DELTA RESPONSE LAG (DAYS)");

        // Bottom bars (inverted — grow downward)
        const lagColor = d3.scaleLinear<string>()
            .domain([1, 3, 6])
            .range(["#3edd8f", "#c9962b", "#e0453a"])
            .clamp(true);

        data.forEach((d, i) => {
            g.append("rect")
                .attr("x", x(String(i))!).attr("width", x.bandwidth())
                .attr("y", topOfBottom)
                .attr("height", yBot(d.dlResponseDays) - topOfBottom)
                .attr("rx", 2)
                .attr("fill", lagColor(d.dlResponseDays))
                .attr("opacity", hoverIdx === i ? 1 : 0.65)
                .attr("cursor", "pointer")
                .on("mouseenter", () => setHoverIdx(i))
                .on("mouseleave", () => setHoverIdx(null));

            // Day count label
            if (x.bandwidth() > 12) {
                g.append("text")
                    .attr("x", x(String(i))! + x.bandwidth() / 2)
                    .attr("y", yBot(d.dlResponseDays) + 12)
                    .attr("text-anchor", "middle")
                    .attr("fill", "var(--radar-text-2)").attr("font-family", "var(--font-mono)").attr("font-size", "8px")
                    .text(d.dlResponseDays >= 6 ? "—" : `${d.dlResponseDays}d`);
            }
        });

        // Step 51: Connecting flow lines
        data.forEach((d, i) => {
            const cx = x(String(i))! + x.bandwidth() / 2;
            const topY = d.uaPriceChange >= 0 ? yTop(d.uaPriceChange) : yTop(0) + Math.abs(yTop(d.uaPriceChange) - yTop(0));
            const botY = topOfBottom;
            g.append("line")
                .attr("x1", cx).attr("x2", cx).attr("y1", topY).attr("y2", botY)
                .attr("stroke", "rgba(148,163,184,0.06)").attr("stroke-width", 1).attr("stroke-dasharray", "2,3");
        });
    }, [data, hoverIdx]);

    const hoverData = hoverIdx !== null ? data[hoverIdx] : null;

    return (
        <div className="radar-chart p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="radar-eyebrow">Competitor Response Lag</p>
                <div className="flex gap-4">
                    <span className="radar-kpi px-3 py-1.5 text-[10px]">
                        <span className="text-slate-500">Avg lag: </span>
                        <span style={{ color: "var(--radar-amber)" }}>{stats.avgLag.toFixed(1)}d</span>
                    </span>
                    <span className="radar-kpi px-3 py-1.5 text-[10px]">
                        <span className="text-slate-500">No response: </span>
                        <span style={{ color: "var(--radar-crimson)" }}>{stats.noResponse}%</span>
                    </span>
                </div>
            </div>
            <svg ref={svgRef} className="w-full" style={{ maxHeight: 340 }} />
            {hoverData && (
                <div className="mt-2 rounded-lg border border-white/[0.06] bg-black/40 p-3 text-[10px] font-mono grid grid-cols-4 gap-2">
                    <div><span className="text-slate-500">Date</span><br /><span className="text-slate-300">{hoverData.date}</span></div>
                    <div><span className="text-slate-500">UAL Δ</span><br /><span style={{ color: "var(--radar-amber)" }}>{hoverData.uaPriceChange > 0 ? "+" : ""}${Math.round(hoverData.uaPriceChange)}</span></div>
                    <div><span className="text-slate-500">DL Lag</span><br /><span className="text-slate-300">{hoverData.dlResponseDays >= 6 ? "No response" : `${hoverData.dlResponseDays} days`}</span></div>
                    <div><span className="text-slate-500">DL Δ</span><br /><span style={{ color: "var(--radar-cyan)" }}>{hoverData.dlPriceChange > 0 ? "+" : ""}${Math.round(hoverData.dlPriceChange)}</span></div>
                </div>
            )}
        </div>
    );
}
