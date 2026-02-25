"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { CumulativeRegretPoint } from "./transforms";

// Steps 42–47: Cumulative regret ribbon chart with CI envelope and shock markers
export default function CumulativeRegretRibbon({ data }: { data: CumulativeRegretPoint[] }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoverIdx, setHoverIdx] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = svgRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e?.isIntersecting) setVisible(true); },
            { threshold: 0.2 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!svgRef.current || !data.length || !visible) return;

        const margin = { top: 24, right: 60, bottom: 40, left: 72 };
        const width = 720 - margin.left - margin.right;
        const height = 280 - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const g = svg.attr("viewBox", "0 0 720 280").append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleLinear().domain([0, data.length - 1]).range([0, width]);
        const yVals = data.flatMap(d => [d.ciLow, d.ciHigh, d.cumRegret]);
        const y = d3.scaleLinear().domain([d3.min(yVals) ?? 0, (d3.max(yVals) ?? 1) * 1.1]).range([height, 0]).nice();

        // X Axis
        g.append("g").attr("transform", `translate(0,${height})`).call(
            d3.axisBottom(x).ticks(6).tickFormat(d => data[Number(d)]?.date?.slice(5) ?? "")
        ).call(g => g.select(".domain").attr("stroke", "rgba(148,163,184,0.1)"))
            .call(g => g.selectAll(".tick text").attr("fill", "var(--radar-text-2)").style("font-family", "var(--font-mono)").style("font-size", "9px"));

        // Y Axis
        g.append("g").call(
            d3.axisLeft(y).ticks(5).tickFormat(d => `$${d3.format(",.0f")(Number(d) / 1000)}K`)
        ).call(g => g.select(".domain").remove())
            .call(g => g.selectAll(".tick line").attr("stroke", "rgba(148,163,184,0.06)").attr("x2", width))
            .call(g => g.selectAll(".tick text").attr("fill", "var(--radar-text-2)").style("font-family", "var(--font-mono)").style("font-size", "10px"));

        // Step 43: CI envelope
        const ciArea = d3.area<CumulativeRegretPoint>()
            .x((_, i) => x(i))
            .y0(d => y(d.ciLow))
            .y1(d => y(d.ciHigh))
            .curve(d3.curveMonotoneX);

        g.append("path").datum(data).attr("d", ciArea)
            .attr("fill", "rgba(62,221,143,0.06)")
            .attr("stroke", "none");

        // CI borders
        g.append("path").datum(data).attr("d", d3.line<CumulativeRegretPoint>().x((_, i) => x(i)).y(d => y(d.ciLow)).curve(d3.curveMonotoneX))
            .attr("fill", "none").attr("stroke", "rgba(62,221,143,0.2)").attr("stroke-dasharray", "3,3").attr("stroke-width", 1);
        g.append("path").datum(data).attr("d", d3.line<CumulativeRegretPoint>().x((_, i) => x(i)).y(d => y(d.ciHigh)).curve(d3.curveMonotoneX))
            .attr("fill", "none").attr("stroke", "rgba(62,221,143,0.2)").attr("stroke-dasharray", "3,3").attr("stroke-width", 1);

        // Step 44: Main cumulative line with draw animation
        const mainLine = d3.line<CumulativeRegretPoint>().x((_, i) => x(i)).y(d => y(d.cumRegret)).curve(d3.curveMonotoneX);
        const path = g.append("path").datum(data).attr("d", mainLine)
            .attr("fill", "none").attr("stroke", "var(--radar-green, #3edd8f)").attr("stroke-width", 2.5).attr("stroke-linecap", "round");

        // Step 46: Animated line draw
        const totalLength = (path.node() as SVGPathElement)?.getTotalLength() ?? 500;
        path.attr("stroke-dasharray", totalLength).attr("stroke-dashoffset", totalLength)
            .transition().duration(2000).ease(d3.easeCubicInOut).attr("stroke-dashoffset", 0);

        // End value label
        const last = data[data.length - 1]!;
        g.append("text")
            .attr("x", x(data.length - 1) + 8).attr("y", y(last.cumRegret) + 4)
            .attr("fill", "var(--radar-green)").attr("font-family", "var(--font-mono)").attr("font-size", "12px").attr("font-weight", 600)
            .text(`$${Math.round(last.cumRegret / 1000)}K`);

        // Step 45: Vertical shock markers
        data.forEach((d, i) => {
            if (!d.hasShock) return;
            g.append("line").attr("x1", x(i)).attr("x2", x(i)).attr("y1", 0).attr("y2", height)
                .attr("stroke", "var(--radar-crimson, #e0453a)").attr("stroke-width", 1).attr("opacity", 0.25);
            g.append("circle").attr("cx", x(i)).attr("cy", y(d.cumRegret)).attr("r", 3)
                .attr("fill", "var(--radar-crimson)").attr("opacity", 0.8);
        });

        // Step 47: Hover scrubber
        const scrubber = g.append("line").attr("y1", 0).attr("y2", height)
            .attr("stroke", "var(--radar-amber)").attr("stroke-width", 1).attr("opacity", 0);
        const hoverDot = g.append("circle").attr("r", 4).attr("fill", "var(--radar-green)").attr("opacity", 0);

        g.append("rect").attr("width", width).attr("height", height).attr("fill", "transparent")
            .on("mousemove", (event) => {
                const [mx] = d3.pointer(event);
                const idx = Math.round(x.invert(mx));
                if (idx >= 0 && idx < data.length) {
                    setHoverIdx(idx);
                    scrubber.attr("x1", x(idx)).attr("x2", x(idx)).attr("opacity", 0.6);
                    hoverDot.attr("cx", x(idx)).attr("cy", y(data[idx]!.cumRegret)).attr("opacity", 1);
                }
            })
            .on("mouseleave", () => {
                setHoverIdx(null);
                scrubber.attr("opacity", 0);
                hoverDot.attr("opacity", 0);
            });
    }, [data, visible]);

    const hoverData = hoverIdx !== null ? data[hoverIdx] : null;

    return (
        <div className="radar-chart p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="radar-eyebrow">Cumulative Policy Lift</p>
                <span className="font-mono text-[10px] text-slate-400">95% CI envelope · {data.filter(d => d.hasShock).length} shock events</span>
            </div>
            <svg ref={svgRef} className="w-full" style={{ maxHeight: 280 }} />
            {hoverData && (
                <div className="mt-2 grid grid-cols-4 gap-2 rounded-lg border border-white/[0.06] bg-black/40 p-3 text-[10px] font-mono">
                    <div><span className="text-slate-500">Date</span><br /><span className="text-slate-300">{hoverData.date}</span></div>
                    <div><span className="text-slate-500">Daily</span><br /><span style={{ color: hoverData.dailyRegret >= 0 ? "var(--radar-green)" : "var(--radar-crimson)" }}>${Math.round(hoverData.dailyRegret).toLocaleString()}</span></div>
                    <div><span className="text-slate-500">Cumulative</span><br /><span style={{ color: "var(--radar-green)" }}>${Math.round(hoverData.cumRegret).toLocaleString()}</span></div>
                    <div><span className="text-slate-500">CI Range</span><br /><span className="text-slate-300">${Math.round(hoverData.ciLow / 1000)}K–${Math.round(hoverData.ciHigh / 1000)}K</span></div>
                </div>
            )}
        </div>
    );
}
