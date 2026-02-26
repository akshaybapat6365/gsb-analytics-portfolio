"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { NeuralEyebrow } from "./Typography";
import type { CumulativeRegretPoint } from "./transforms";
import { scaleLinear } from "d3-scale";
import { area, curveMonotoneX } from "d3-shape";

const C = {
    steel: "#6B9FD4",
    rose: "#C75B5B",
    pewter: "#8B8FAE",
} as const;

/**
 * Phase 4 (Step 45): RegretRibbonAdvanced
 * A ribbon chart spanning structural confidence intervals with 
 * intense mix-blend-mode layering and continuous D3 splines.
 */

export function RegretRibbonAdvanced({ data }: { data: CumulativeRegretPoint[] }) {

    const width = 800;
    const height = 300;
    const padding = { top: 40, right: 20, bottom: 40, left: 60 };

    const { pathDef, maxX, maxY } = useMemo(() => {
        if (!data?.length) return { pathDef: "", maxX: 0, maxY: 0 };

        const xMax = data.length - 1;
        const yMax = Math.max(...data.map(d => d.cumRegret));

        const xScale = scaleLinear().domain([0, xMax]).range([padding.left, width - padding.right]);
        const yScale = scaleLinear().domain([0, yMax * 1.1]).range([height - padding.bottom, padding.top]);

        const areaBuilder = area<CumulativeRegretPoint>()
            .x((d, i) => xScale(i))
            .y0(yScale(0))
            .y1(d => yScale(d.cumRegret))
            .curve(curveMonotoneX);

        return {
            pathDef: areaBuilder(data) || "",
            maxX: xMax,
            maxY: yMax
        };
    }, [data]);

    if (!data?.length) return null;

    return (
        <div className="w-full aspect-[8/3] relative neural-glass-panel border-plasma-purple/30 p-4">
            <NeuralEyebrow className="text-plasma-purple tracking-[0.2em] absolute top-4 left-6 z-10">CUMULATIVE_REGRET_INTEGRAL</NeuralEyebrow>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ mixBlendMode: 'screen' }}>
                <defs>
                    <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.pewter} stopOpacity="0.8" />
                        <stop offset="50%" stopColor={C.rose} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={C.steel} stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="ribbonGlow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Grid / Crosshairs */}
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke={C.steel} strokeWidth="1" className="opacity-40" />
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke={C.steel} strokeWidth="1" className="opacity-40" />

                <text x={padding.left - 10} y={padding.top} fill={C.steel} fontSize={10} fontFamily="monospace" textAnchor="end" className="opacity-60">${(maxY / 1000).toFixed(0)}k</text>

                {/* The Area Spline */}
                <motion.path
                    d={pathDef}
                    fill="url(#ribbonGrad)"
                    stroke={C.pewter}
                    strokeWidth="2"
                    filter="url(#ribbonGlow)"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            </svg>
        </div>
    );
}
