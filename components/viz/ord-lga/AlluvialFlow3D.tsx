"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { NeuralEyebrow } from "./Typography";
import type { WeeklyBin } from "./transforms";

const C = {
    steel: "#6B9FD4",
    frost: "#E2E8F0",
} as const;

/**
 * Phase 4 (Step 43): AlluvialFlow3D
 * Overlapping bezier ribbons showing fluid market share transitioning with screen blend.
 */

export function AlluvialFlow3D({ data }: { data: WeeklyBin[] }) {
    const width = 800;
    const height = 300;
    const padding = { top: 60, bottom: 40, left: 20, right: 20 };

    const paths = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Simulate flow paths bridging weeks
        const flows = [];
        const numWeeks = data.length;
        const colWidth = (width - padding.left - padding.right) / (numWeeks - 1 || 1);

        for (let i = 0; i < numWeeks - 1; i++) {
            const w1 = data[i];
            const w2 = data[i + 1];

            const x1 = padding.left + i * colWidth;
            const x2 = padding.left + (i + 1) * colWidth;

            // Base heights based on UAL Market Share
            const y1_A = padding.top + (1 - w1.avgUaShare) * (height - padding.top - padding.bottom);
            const y2_A = padding.top + (1 - w2.avgUaShare) * (height - padding.top - padding.bottom);

            // Bezier connection
            const cp1x = x1 + colWidth * 0.5;
            const cp2x = x2 - colWidth * 0.5;

            const d = `M ${x1},${y1_A} C ${cp1x},${y1_A} ${cp2x},${y2_A} ${x2},${y2_A}`;
            flows.push(d);
        }
        return flows;
    }, [data]);

    return (
        <div className="w-full aspect-[8/3] relative neural-glass-panel border-plasma-cyan/30 p-4 overflow-hidden group">
            <div className="absolute top-4 left-6 z-10 w-full">
                <NeuralEyebrow className="text-plasma-cyan">MARKET_SHARE_ALLUVIAL_FLOW</NeuralEyebrow>
                <p className="border-l border-plasma-cyan/50 pl-2 mt-2 font-mono text-xs text-frost-white/60">
                    Fluid dynamic mass transfer between competing reservation systems.
                </p>
            </div>

            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{ mixBlendMode: 'screen' }}>
                <defs>
                    <filter id="alluvialGlow">
                        <feGaussianBlur stdDeviation="8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {paths.map((d, i) => (
                    <motion.path
                        key={i}
                        d={d}
                        fill="none"
                        stroke={C.steel}
                        strokeWidth="20"
                        strokeLinecap="round"
                        filter="url(#alluvialGlow)"
                        className="opacity-30 mix-blend-screen group-hover:opacity-60 transition-opacity duration-500"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 0.3 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                    />
                ))}

                {paths.map((d, i) => (
                    <motion.path
                        key={`core-${i}`}
                        d={d}
                        fill="none"
                        stroke={C.frost}
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="opacity-80"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                    />
                ))}
            </svg>
        </div>
    );
}
