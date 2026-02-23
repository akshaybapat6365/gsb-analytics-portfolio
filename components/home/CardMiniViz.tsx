"use client";

import { useRef, useEffect } from "react";
import {
    select,
    scaleLinear,
    line,
    area,
    curveMonotoneX,
    curveBasis,
    pie,
    arc,
} from "d3";
import type { HomeVizType } from "@/lib/projects/catalog";

type Props = {
    vizType: HomeVizType;
    data: number[];
    accent: string; /* r,g,b */
    width?: number;
    height?: number;
};

/**
 * D3-rendered mini-visualization for each project card.
 * Uses real `spark` data from the catalog, rendered with D3
 * scales, generators, and shapes — NOT hand-coded SVG.
 *
 * Each vizType gets a completely different D3 chart:
 *  - matrix:   heatmap grid (pricing regret matrix)
 *  - timeline: lollipop chart (event detection timeline)
 *  - frontier: scatter + frontier curve (Pareto threshold)
 *  - band:     area band with intervention (DiD)
 *  - nodes:    force-placed network (spatial game)
 *  - bubbles:  weighted scatter (portfolio allocation)
 */
export function CardMiniViz({ vizType, data, accent, width = 300, height = 120 }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        const svg = select(svgRef.current);
        svg.selectAll("*").remove();

        const pad = { t: 8, r: 10, b: 8, l: 10 };
        const w = width - pad.l - pad.r;
        const h = height - pad.t - pad.b;
        const g = svg
            .attr("viewBox", `0 0 ${width} ${height}`)
            .append("g")
            .attr("transform", `translate(${pad.l},${pad.t})`);

        const rgb = accent;
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        switch (vizType) {
            case "matrix":
                renderMatrix(g, data, w, h, rgb, min, range);
                break;
            case "timeline":
                renderTimeline(g, data, w, h, rgb, min, range);
                break;
            case "frontier":
                renderFrontier(g, data, w, h, rgb, min, range);
                break;
            case "band":
                renderBand(g, data, w, h, rgb, min, range);
                break;
            case "nodes":
                renderNodes(g, data, w, h, rgb, min, range);
                break;
            case "bubbles":
                renderBubbles(g, data, w, h, rgb, min, range);
                break;
            default:
                renderBand(g, data, w, h, rgb, min, range);
        }
    }, [vizType, data, accent, width, height]);

    return (
        <svg
            ref={svgRef}
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
        />
    );
}

/* ────────────────────────────────────────────────────── */
/* Matrix: Heatmap grid — pricing/regret                 */
/* ────────────────────────────────────────────────────── */

function renderMatrix(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: number[], w: number, h: number, rgb: string, min: number, range: number,
) {
    const cols = 5;
    const rows = Math.ceil(data.length / cols);
    const cellW = w / cols - 2;
    const cellH = h / rows - 2;

    // Extend data to fill grid
    const cells: number[] = [];
    for (let i = 0; i < rows * cols; i++) {
        cells.push(data[i % data.length]);
    }

    const x = scaleLinear().domain([0, cols]).range([0, w]);
    const y = scaleLinear().domain([0, rows]).range([0, h]);

    // Grid cells
    g.selectAll("rect.cell")
        .data(cells)
        .enter()
        .append("rect")
        .attr("x", (_, i) => x(i % cols) + 1)
        .attr("y", (_, i) => y(Math.floor(i / cols)) + 1)
        .attr("width", cellW)
        .attr("height", cellH)
        .attr("rx", 3)
        .attr("fill", (d) => {
            const norm = (d - min) / range;
            return `rgba(${rgb}, ${(0.08 + norm * 0.5).toFixed(2)})`;
        });

    // Highlight max cell
    const maxIdx = data.indexOf(Math.max(...data));
    const maxRow = Math.floor(maxIdx / cols);
    const maxCol = maxIdx % cols;
    g.append("rect")
        .attr("x", x(maxCol) + 1)
        .attr("y", y(maxRow) + 1)
        .attr("width", cellW)
        .attr("height", cellH)
        .attr("rx", 3)
        .attr("fill", "none")
        .attr("stroke", `rgba(${rgb}, 0.8)`)
        .attr("stroke-width", 1.5);
}

/* ────────────────────────────────────────────────────── */
/* Timeline: Lollipop chart — event detection            */
/* ────────────────────────────────────────────────────── */

function renderTimeline(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: number[], w: number, h: number, rgb: string, min: number, range: number,
) {
    const x = scaleLinear().domain([0, data.length - 1]).range([0, w]);
    const y = scaleLinear().domain([min, min + range]).range([h, 4]);

    // Baseline
    g.append("line")
        .attr("x1", 0).attr("x2", w)
        .attr("y1", h).attr("y2", h)
        .attr("stroke", "rgba(255,255,255,0.04)")
        .attr("stroke-width", 1);

    // Stems + dots
    data.forEach((d, i) => {
        const cx = x(i);
        const cy = y(d);
        const isSpike = i >= data.length - 3;

        g.append("line")
            .attr("x1", cx).attr("x2", cx)
            .attr("y1", h).attr("y2", cy)
            .attr("stroke", `rgba(${rgb}, ${isSpike ? 0.6 : 0.15})`)
            .attr("stroke-width", isSpike ? 2 : 1);

        g.append("circle")
            .attr("cx", cx).attr("cy", cy)
            .attr("r", isSpike ? 4 : 2.5)
            .attr("fill", `rgba(${rgb}, ${isSpike ? 0.85 : 0.3})`);
    });

    // Alert zone
    const alertStart = x(data.length - 3);
    g.append("rect")
        .attr("x", alertStart)
        .attr("y", 0)
        .attr("width", w - alertStart)
        .attr("height", h)
        .attr("rx", 4)
        .attr("fill", `rgba(${rgb}, 0.03)`)
        .attr("stroke", `rgba(${rgb}, 0.12)`)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,2");
}

/* ────────────────────────────────────────────────────── */
/* Frontier: Scatter + efficient frontier — threshold    */
/* ────────────────────────────────────────────────────── */

function renderFrontier(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: number[], w: number, h: number, rgb: string, min: number, range: number,
) {
    const x = scaleLinear().domain([0, data.length - 1]).range([8, w - 8]);
    const y = scaleLinear().domain([min - 1, min + range + 1]).range([h - 4, 4]);

    // Faint axes
    g.append("line")
        .attr("x1", 4).attr("x2", 4).attr("y1", 0).attr("y2", h)
        .attr("stroke", "rgba(255,255,255,0.04)");
    g.append("line")
        .attr("x1", 4).attr("x2", w).attr("y1", h - 2).attr("y2", h - 2)
        .attr("stroke", "rgba(255,255,255,0.04)");

    // Frontier curve (D3 line generator with curve)
    const sorted = data.map((d, i) => ({ i, d })).sort((a, b) => a.i - b.i);
    const frontierLine = line<{ i: number; d: number }>()
        .x((p) => x(p.i))
        .y((p) => y(p.d))
        .curve(curveMonotoneX);

    g.append("path")
        .datum(sorted)
        .attr("d", frontierLine)
        .attr("fill", "none")
        .attr("stroke", `rgba(${rgb}, 0.35)`)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,3");

    // Scatter dots with varying size
    data.forEach((d, i) => {
        const norm = (d - min) / range;
        g.append("circle")
            .attr("cx", x(i))
            .attr("cy", y(d))
            .attr("r", 3 + norm * 4)
            .attr("fill", `rgba(${rgb}, ${(0.15 + norm * 0.45).toFixed(2)})`)
            .attr("stroke", `rgba(${rgb}, ${(0.2 + norm * 0.3).toFixed(2)})`)
            .attr("stroke-width", 0.5);
    });

    // Highlight optimal point
    const optIdx = data.length - 2;
    g.append("circle")
        .attr("cx", x(optIdx))
        .attr("cy", y(data[optIdx]))
        .attr("r", 10)
        .attr("fill", "none")
        .attr("stroke", `rgba(${rgb}, 0.45)`)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,2");
}

/* ────────────────────────────────────────────────────── */
/* Band: Area with confidence band + DiD intervention    */
/* ────────────────────────────────────────────────────── */

function renderBand(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: number[], w: number, h: number, rgb: string, min: number, range: number,
) {
    const x = scaleLinear().domain([0, data.length - 1]).range([0, w]);
    const y = scaleLinear().domain([min - 2, min + range + 2]).range([h, 0]);

    const bandWidth = range * 0.2;

    // D3 area generator for confidence band
    const bandGen = area<number>()
        .x((_, i) => x(i))
        .y0((d) => y(d - bandWidth))
        .y1((d) => y(d + bandWidth))
        .curve(curveBasis);

    g.append("path")
        .datum(data)
        .attr("d", bandGen)
        .attr("fill", `rgba(${rgb}, 0.06)`);

    // Center line
    const centerLine = line<number>()
        .x((_, i) => x(i))
        .y((d) => y(d))
        .curve(curveBasis);

    g.append("path")
        .datum(data)
        .attr("d", centerLine)
        .attr("fill", "none")
        .attr("stroke", `rgba(${rgb}, 0.55)`)
        .attr("stroke-width", 2);

    // Intervention line at ~40%
    const cutIdx = Math.floor(data.length * 0.4);
    const cutX = x(cutIdx);
    g.append("line")
        .attr("x1", cutX).attr("x2", cutX)
        .attr("y1", 0).attr("y2", h)
        .attr("stroke", `rgba(${rgb}, 0.35)`)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,3");

    // POST label
    g.append("text")
        .attr("x", cutX + 4)
        .attr("y", 10)
        .attr("fill", `rgba(${rgb}, 0.45)`)
        .attr("font-size", "7")
        .attr("font-family", "var(--font-mono)")
        .text("POST");
}

/* ────────────────────────────────────────────────────── */
/* Nodes: Force-placed network — spatial game theory     */
/* ────────────────────────────────────────────────────── */

function renderNodes(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: number[], w: number, h: number, rgb: string, min: number, range: number,
) {
    const cx = w / 2;
    const cy = h / 2;

    // Position nodes in a radial layout
    const nodes = data.map((d, i) => {
        const norm = (d - min) / range;
        const angle = (i / data.length) * Math.PI * 2 - Math.PI / 2;
        const radius = 25 + norm * 20;
        return {
            x: cx + Math.cos(angle) * radius,
            y: cy + Math.sin(angle) * radius * 0.8,
            r: 3.5 + norm * 5,
            o: 0.2 + norm * 0.55,
        };
    });

    // Hub
    g.append("circle")
        .attr("cx", cx).attr("cy", cy).attr("r", 5)
        .attr("fill", `rgba(${rgb}, 0.12)`)
        .attr("stroke", `rgba(${rgb}, 0.25)`)
        .attr("stroke-width", 1);

    // Hub connections
    nodes.forEach((n) => {
        g.append("line")
            .attr("x1", cx).attr("y1", cy)
            .attr("x2", n.x).attr("y2", n.y)
            .attr("stroke", `rgba(${rgb}, 0.06)`)
            .attr("stroke-width", 0.5);
    });

    // Edges between adjacent nodes
    nodes.forEach((n, i) => {
        const next = nodes[(i + 1) % nodes.length];
        g.append("line")
            .attr("x1", n.x).attr("y1", n.y)
            .attr("x2", next.x).attr("y2", next.y)
            .attr("stroke", `rgba(${rgb}, 0.1)`)
            .attr("stroke-width", 1);
    });

    // Cross edges
    nodes.forEach((n, i) => {
        if (i % 2 === 0) {
            const opp = nodes[(i + Math.floor(nodes.length / 2)) % nodes.length];
            g.append("line")
                .attr("x1", n.x).attr("y1", n.y)
                .attr("x2", opp.x).attr("y2", opp.y)
                .attr("stroke", `rgba(${rgb}, 0.04)`)
                .attr("stroke-width", 0.5);
        }
    });

    // Nodes
    nodes.forEach((n) => {
        g.append("circle")
            .attr("cx", n.x).attr("cy", n.y)
            .attr("r", n.r)
            .attr("fill", `rgba(${rgb}, ${n.o.toFixed(2)})`);
    });
}

/* ────────────────────────────────────────────────────── */
/* Bubbles: Weighted scatter — portfolio allocation      */
/* ────────────────────────────────────────────────────── */

function renderBubbles(
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    data: number[], w: number, h: number, rgb: string, min: number, range: number,
) {
    const x = scaleLinear().domain([0, data.length - 1]).range([12, w - 12]);
    const y = scaleLinear().domain([min - 1, min + range + 1]).range([h - 4, 4]);

    // Faint axes
    g.append("line")
        .attr("x1", 6).attr("x2", 6).attr("y1", 0).attr("y2", h)
        .attr("stroke", "rgba(255,255,255,0.03)");
    g.append("line")
        .attr("x1", 6).attr("x2", w).attr("y1", h - 2).attr("y2", h - 2)
        .attr("stroke", "rgba(255,255,255,0.03)");

    // Bubbles with D3-computed positions
    data.forEach((d, i) => {
        const norm = (d - min) / range;
        const jitterX = (i % 2 === 0 ? 1 : -1) * (i % 3) * 4;
        const jitterY = (i % 3 === 0 ? -1 : 1) * (i % 2) * 3;
        const bx = x(i) + jitterX;
        const by = y(d) + jitterY;
        const r = 5 + norm * 14;

        g.append("circle")
            .attr("cx", bx)
            .attr("cy", by)
            .attr("r", r)
            .attr("fill", `rgba(${rgb}, ${(0.08 + norm * 0.3).toFixed(2)})`)
            .attr("stroke", `rgba(${rgb}, ${(0.12 + norm * 0.2).toFixed(2)})`)
            .attr("stroke-width", 0.5);
    });

    // Frontier dashed line over top bubbles
    const sorted = data.map((d, i) => [x(i), y(d)] as [number, number]).sort((a, b) => a[0] - b[0]);
    const frontierLine = line<[number, number]>()
        .x((p) => p[0])
        .y((p) => p[1] - 4)
        .curve(curveMonotoneX);

    g.append("path")
        .datum(sorted.slice(0, 5))
        .attr("d", frontierLine)
        .attr("fill", "none")
        .attr("stroke", `rgba(${rgb}, 0.18)`)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,3");
}
